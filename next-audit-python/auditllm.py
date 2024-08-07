# Import necessary modules and classes
from filereader import FileReader
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain_community.llms import OpenAI
from langchain_community.callbacks import get_openai_callback

# Prompt used for classifying responses. Can modify this for contextualization
def prompt_for_details_prefix(additional_context: str, example: str, best_practise: str, client_name : str,audit_year_end : str, pwc_auditor_name:str ) -> str:  
    example_text = f"\nUse the following example to guide your tone and structure, but DO NOT COPY any specific information or data from it: {example}" if example else ""  
    best_practise_text = f"\nBest Practice: {best_practise}\nUse this best practice as a standard to judge if the control is appropriate" if best_practise else ""  
    additional_context += f"\nThe name of the Client is {client_name}\n and this is for an Audit Year End of {audit_year_end}\n The PwC personnel that performed the control are {pwc_auditor_name} "

    return f"""  
    You are a PwC IT audit team documenting the audit of the design and implementation of IT controls. 
    Additional Context: {additional_context}   
    Provide a detailed response to the following question. Include as much context and specific information as possible.  
    {example_text}  
    {best_practise_text}  
    """  

def prompt_prefix (additional_context: str, example: str, best_practise: str, client_name : str,audit_year_end : str, pwc_auditor_name:str )-> str:
	return f""" You are a PwC IT audit team that performed the external audit of the design and implementation of a change management control of a client called {client_name} after inquiry with relevant client personnel and inspection of the client document. This is for the audit period ending on {audit_year_end}. This is an internal documentation stored in PwC files, so write like it will only be read by PwC personnel. Including as much context and specificity as possible, provide a detailed response to this question. \n"""

def prompt_suffix(additional_context: str, example: str, best_practise: str, client_name : str,audit_year_end : str, pwc_auditor_name:str ) -> str:  
    example_text = f"\n Use the following example to guide your tone and structure, but DO NOT COPY any specific information or data from it. Use past tenses and use WE instead of I's.  Example: \"{example}\"\n" if example else ""  
    best_practise_text = f"Use this best practise as a standard to judge if the control as operated by the client is appropriate. Best Practise: \"{best_practise}\"\n" if best_practise else ""  
    return f"""  
    Additional Context: {additional_context}    
    {example_text}  
    {best_practise_text}  
    Name of the PwC Team Members that performed the walkthrough : {pwc_auditor_name}
    """ 
    

# Class to represent a document with its content and metadata
class Document:
    def __init__(self, text, metadata):
        self.page_content = text  # The content of the document
        self.metadata = metadata  # Metadata associated with the document

# AuditLLM class for handling the auditing logic
class AuditLLM:
    # Initializes the model class with necessary components. Sets up the file_reader, embeddings, chain, and text_splitter needed for processing the input text and generating results.
    def __init__(self, file_reader: FileReader) -> None:
        self.file_reader = file_reader  # Instance of FileReader for reading files
        self.embeddings = OpenAIEmbeddings()  # OpenAI embeddings for text processing
        self.chain = load_qa_chain(OpenAI(temperature=0.0), chain_type="stuff")  # Load QA chain with OpenAI LLM
        self.text_splitter = CharacterTextSplitter(
            separator="\n\n", #Spilt by paragraphs
            chunk_size=1000,
            chunk_overlap=200, #More overlap for context
            length_function=len
        )  # Split text into chunks for processing

    # Reads a template and generates results based on the provided text and program
    def read_template_generate_result(self, texts_with_filenames: list, program: str, additional_context: str, client_name: str, audit_year_end: str, pwc_auditor_name: str):
        """
        :param texts_with_filenames: List of tuples containing text (uploaded files) and corresponding filename
        :param program: The work program (D&I template) name for which the audit is being conducted
        :param additional_context: Additional context provided by the user.
        :return: A dictionary containing the audit results
        """
        # Get the file path for the D&I template and read the CSV data
        program_file_path = self.file_reader.get_file_path(program)
        template_csv_data = self.file_reader.read_csv_template_file(program_file_path)
        # additional_context += f"\nClient Name: {client_name}\nAudit Year End: {audit_year_end}\nPwC Auditor Name: {pwc_auditor_name}"
        
        documents = []
        # Split the text (uploaded files eg policies) into chunks and create Document instances with metadata
        for text, filename in texts_with_filenames:
            chunks = self.text_splitter.split_text(text)
            documents.extend([Document(chunk, {"source": f"chunk_{i}", "file_name": filename}) for i, chunk in enumerate(chunks)])
        
        # Create FAISS index with documents and their embeddings
        knowledge_base = FAISS.from_documents(documents, self.embeddings)

        result = {}  # Dictionary to store the results

        # Iterate through each domain in the CSV data (D&I template)
        for domain, domain_questions in template_csv_data.items():
            domain_list = []
            result[domain] = domain_list

            # Iterate through each question in the domain
            for domain_question_data in domain_questions:
                domain_question = domain_question_data["question"]
                example = domain_question_data["example"]
                best_practise = domain_question_data["best_practise"]
                # print(best_practise)

                # Perform similarity search for the question
                docs = knowledge_base.similarity_search(domain_question)

                # Generate details using the QA chain. This is returns the finding/details column of the final output

                prompt_for_details = prompt_for_details_prefix(additional_context,"","","","","") + f"Question: {domain_question}\n"
                with get_openai_callback() as cb:
                    details = self.chain.run(input_documents=docs, question=prompt_for_details)

                # print(details)
                
                # prompt_for_details_with_example = prompt_for_details_prefix(additional_context,example,best_practise,client_name,audit_year_end,pwc_auditor_name) + f"Question: {domain_question}\n"
                # # prompt_for_details_with_example = prompt_for_details_prefix(additional_context,example) + f"Question: {domain_question}\n"
                # with get_openai_callback() as cb:
                #     details_from_example = self.chain.run(input_documents=docs, question=prompt_for_details_with_example)

                prompt_for_details_with_example = prompt_prefix(additional_context,example,best_practise,client_name,audit_year_end,pwc_auditor_name) + f"Question: {domain_question}\n"+ prompt_suffix(additional_context,example,best_practise,client_name,audit_year_end,pwc_auditor_name)
                with get_openai_callback() as cb:
                    details_from_example = self.chain.run(input_documents=docs, question=prompt_for_details_with_example)


                

                # Perform similarity search for the details to generate draft result. For the draft conclusion, we combine the question and answer and recheck the merged documents (chunks)  that have the details
                details_docs = knowledge_base.similarity_search(details)
                
                prompt_for_draft_result = ""
                prompt_for_draft_result += f"Question: {domain_question}\nAnswer: {details}\n"
                with get_openai_callback() as cb:
                    draft_result_from_prompt = self.chain.run(input_documents=details_docs, question=prompt_for_draft_result)

                # Extract references for details and draft results
                details_references = [{"source": doc.metadata['source'], "file_name": doc.metadata['file_name'], "text": doc.page_content} for doc in docs]
                draft_result_references = [{"source": doc.metadata['source'], "file_name": doc.metadata['file_name'], "text": doc.page_content} for doc in details_docs]
                # citations = [f"{ref['source']}" for ref in details_references]

                print(prompt_for_details_with_example)
                # print("CITATION \n")
                # print(citations)
                # print("\n")
                # print("DETALS with CITATIONS \n")
                # response_with_citations = details + "\n\nCitations:\n" + "\n".join(citations)
                # print(response_with_citations)

                # Convert draft result to Pass/Fail/Unknown. Convert to pass and fail for presentation. Also protect against the LLM having responses more words.
                if 'Effective' in draft_result_from_prompt:
                    answer = 'Pass'
                elif 'Ineffective' in draft_result_from_prompt:
                    answer = 'Fail'
                else:
                    answer = 'Unknown'

                # Append the result to the domain list
                domain_list.append({
                    "criteria": domain_question,
                    "answer": answer,
                    "details": details,
                    "details_from_example": details_from_example,
                    "details_references": details_references,
                    "draft_result_references": draft_result_references
                })

        return result

    # Generates findings based on the provided text and answers
    def generate_findings(self, text: str, answer_list):
        return {"overview": "", "summary": ""}
