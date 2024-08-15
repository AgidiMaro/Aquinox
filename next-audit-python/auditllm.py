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
	return f""" 
    You are a PwC IT audit team that performed the external audit of the design and implementation of a change management control of a client called {client_name} after inquiry with relevant client personnel and inspection of the client document. This is for the audit period ending on {audit_year_end}. This is an internal documentation stored in PwC files, so write like it will only be read by PwC personnel. Provide a detailed response to this question, including as much context as possible but with specificity. 
    """

def prompt_suffix(additional_context: str, example: str, best_practise: str, client_name : str,audit_year_end : str, pwc_auditor_name:str ) -> str:  
    # example_text = f"\n Use the following dummy response to guide your tone and structure, but DO NOT include any information from the dummy response in your response to the question. Use past tenses and use WE instead of I's. Example: \"{example}\"\n" if example else ""  
    example_text=""
    best_practise_text = f"Use this key considerations from the PwC guideline to determine if the control as operated by the client is appropriate. Key Considerations: \"{best_practise}\"\n" if best_practise else ""  
    return f"""   
    {example_text}  
    {best_practise_text}  
    Name of the PwC Team Members that performed the walkthrough : {pwc_auditor_name}
    Additional Context: {additional_context}  
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
    def read_template_generate_result(self, texts_with_filenames_design:list, texts_with_filenames_implementation:list, program: str, additional_context: str, client_name: str, audit_year_end: str, pwc_auditor_name: str):
        """
        :param texts_with_filenames: List of tuples containing text (uploaded files) and corresponding filename
        :param program: The work program (D&I template) name for which the audit is being conducted
        :param additional_context: Additional context provided by the user.
        :return: A dictionary containing the audit results
        """
        # Get the file path for the D&I template and read the CSV data
        program_file_path = self.file_reader.get_file_path(program)
        template_csv_data = self.file_reader.read_csv_template_file(program_file_path)
        
        design_documents = []
        implementation_documents = []

        # Split the text (uploaded files eg policies) into chunks and create Document instances with metadata
        #--Design
        for text_design, filename_design in texts_with_filenames_design:
            design_chunks = self.text_splitter.split_text(text_design)
            design_documents.extend([Document(chunk, {"source": f"chunk_{i}", "file_name": filename_design}) for i, chunk in enumerate(design_chunks)])
        
        #--Implementation
        for text_implementation, filename_implementaton in texts_with_filenames_implementation:
            implementation_chunks = self.text_splitter.split_text(text_implementation)
            implementation_documents.extend([Document(chunk, {"source": f"chunk_{i}", "file_name": filename_implementaton}) for i, chunk in enumerate(implementation_chunks)])


        # Create FAISS index with documents and their embeddings
        design_knowledge_base = FAISS.from_documents(design_documents, self.embeddings)
        implementation_knowledge_base = FAISS.from_documents(implementation_documents, self.embeddings)

        result = {}  # Dictionary to store the results

        # Iterate through each domain in the CSV data (D&I template)
        for domain, domain_questions in template_csv_data.items():
            domain_list = []
            result[domain] = domain_list

            # Iterate through each question in the domain
            for domain_question_data in domain_questions:
                # domain_question = domain_question_data["question"]
                # example = domain_question_data["example"]
                # best_practise = domain_question_data["best_practise"]

                design_procedure = domain_question_data["design_procedure"]
                design_consideration = domain_question_data["design_consideration"]
                design_example = domain_question_data["design_example"]
                implementation_procedure = domain_question_data["implementation_procedure"]
                implementation_consideration = domain_question_data["implementation_consideration"]
                implementation_example = domain_question_data["implementation_example"]
                        

                # Perform similarity search for the question
                design_docs = design_knowledge_base.similarity_search(design_procedure)
                implementation_docs = implementation_knowledge_base.similarity_search(implementation_procedure)

                # print(f'DESIGN DOCs/n/n {design_docs}/n/n')
                # print(f'IMPLEMENTATION DOCs/n/n {implementation_docs}/n/n')


                # Generate details using the QA chain. This is returns the finding/details column of the final output
                #--Design
                prompt_for_design_details = prompt_for_details_prefix(additional_context,"","","","","") + f"Question: {design_procedure}\n"
                prompt_for_design_details_example = prompt_prefix(additional_context,design_example,design_consideration,client_name,audit_year_end,pwc_auditor_name) + f"Question: {design_procedure}\n"+ prompt_suffix(additional_context,design_example,design_consideration,client_name,audit_year_end,pwc_auditor_name)
                
                with get_openai_callback() as cb:
                    design_details = self.chain.run(input_documents=design_docs, question=prompt_for_design_details)
                    design_details_from_example = self.chain.run(input_documents=design_docs, question=prompt_for_design_details_example)
                # Extract references for design
                design_details_references = [{"source": doc.metadata['source'], "file_name": doc.metadata['file_name'], "text": doc.page_content} for doc in design_docs]

                #--Implementation
                prompt_for_implementation_details = prompt_for_details_prefix(additional_context,"","","","","") + f"Question: {implementation_procedure}\n"
                prompt_for_implementation_details_example = prompt_prefix(additional_context,implementation_example,implementation_consideration,client_name,audit_year_end,pwc_auditor_name) + f"Question: {implementation_procedure}\n"+ prompt_suffix(additional_context,implementation_example,implementation_consideration,client_name,audit_year_end,pwc_auditor_name)
                
                with get_openai_callback() as cb:
                    implementation_details = self.chain.run(input_documents=implementation_docs, question=prompt_for_implementation_details)
                    implementation_details_from_example = self.chain.run(input_documents=implementation_docs, question=prompt_for_implementation_details_example)
                # Extract references for design and implementaion details
                implementation_details_references = [{"source": doc.metadata['source'], "file_name": doc.metadata['file_name'], "text": doc.page_content} for doc in implementation_docs]

                print(f'DESIGN PROMPT/n/n {prompt_for_design_details_example}/n/n')
                print(f'IMPLEMENTATION DETAILS PROMPT/n/n {prompt_for_implementation_details_example}/n/n')

                # Perform similarity search for the details to generate draft result. For the draft conclusion, we combine the question and answer and recheck the merged documents (chunks)  that have the details
                # prompt_for_draft_result = ""
                # prompt_for_draft_result += f"Question: {implementation_procedure}\nAnswer: {implementation_details_from_example}\n"
                # with get_openai_callback() as cb:
                #     draft_result_from_prompt = self.chain.run(input_documents=details_docs, question=prompt_for_draft_result)

                # draft_result_references = [{"source": doc.metadata['source'], "file_name": doc.metadata['file_name'], "text": doc.page_content} for doc in details_docs]
                # draft_result_from_prompt = prompt_for_implementation_details
                # draft_result_references = implementation_details_references
                # citations = [f"{ref['source']}" for ref in details_references]

                # print(prompt_for_details_with_example)
        

                # Convert draft result to Pass/Fail/Unknown. Convert to pass and fail for presentation. Also protect against the LLM having responses more words.
                if 'Effective' in design_details_from_example:
                    answer = 'Pass'
                elif 'Ineffective' in design_details_from_example:
                    answer = 'Fail'
                else:
                    answer = 'Unknown'

                # Append the result to the domain list
                domain_list.append({
                    # "criteria": domain_question,
                    # "answer": answer,
                    # "details": details,
                    # "details_from_example": details_from_example,
                    # "details_references": details_references,
                    # "draft_result_references": draft_result_references

                    "tailored_procedure_design": design_procedure,
                    "design_details": design_details,
                    "design_details_from_example": design_details_from_example,
                    "design_reference": design_details_references,

                    "tailored_procedure_implementation": implementation_procedure,
                    "implementation_details": implementation_details,
                    "implementation_details_from_example": implementation_details_from_example,
                    "implementation_reference": implementation_details_references,
                    "answer":answer
                })

        return result

    # Generates findings based on the provided text and answers
    def generate_findings(self, text: str, answer_list):
        return {"overview": "", "summary": ""}
