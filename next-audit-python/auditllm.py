# Import necessary modules and classes
from filereader import FileReader
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain_community.llms import OpenAI
from langchain_community.callbacks import get_openai_callback

# Prompt used for classifying responses. Can modify this for contextualization
prompt_for_draft_result_prefix = "Classify the response to the question as 'Effective', 'Ineffective' or 'Unknown' based on best practice for IT change management.\n"

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
            separator="\n",
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
        )  # Split text into chunks for processing

    # Reads a template and generates results based on the provided text and program
    def read_template_generate_result(self, texts_with_filenames: list, program: str):
        """
        :param texts_with_filenames: List of tuples containing text (uploaded files) and corresponding filename
        :param program: The work program (D&I template) name for which the audit is being conducted
        :return: A dictionary containing the audit results
        """
        # Get the file path for the D&I template and read the CSV data
        program_file_path = self.file_reader.get_file_path(program)
        csv_data = self.file_reader.read_csv_file(program_file_path)
        
        documents = []
        # Split the text (uploaded files eg policies) into chunks and create Document instances with metadata
        for text, filename in texts_with_filenames:
            chunks = self.text_splitter.split_text(text)
            documents.extend([Document(chunk, {"source": f"chunk_{i}", "file_name": filename}) for i, chunk in enumerate(chunks)])
        
        # Create FAISS index with documents and their embeddings
        knowledge_base = FAISS.from_documents(documents, self.embeddings)

        result = {}  # Dictionary to store the results

        # Iterate through each domain in the CSV data (D&I template)
        for domain, domain_questions in csv_data.items():
            domain_list = []
            result[domain] = domain_list

            # Iterate through each question in the domain
            for domain_question in domain_questions:
                # Perform similarity search for the question
                docs = knowledge_base.similarity_search(domain_question)
                # Generate details using the QA chain. This is returns the finding/details column of the final output
                with get_openai_callback() as cb:
                    details = self.chain.run(input_documents=docs, question=domain_question)

                # Perform similarity search for the details to generate draft result. For the draft conclusion, we combine the question and answer and recheck the merged documents (chunks)  that have the details
                details_docs = knowledge_base.similarity_search(details)
                prompt_for_draft_result = prompt_for_draft_result_prefix 
                prompt_for_draft_result += f"Question: {domain_question}\nAnswer: {details}\n"
                with get_openai_callback() as cb:
                    draft_result_from_prompt = self.chain.run(input_documents=details_docs, question=prompt_for_draft_result)

                # Extract references for details and draft results
                details_references = [{"source": doc.metadata['source'], "file_name": doc.metadata['file_name'], "text": doc.page_content} for doc in docs]
                draft_result_references = [{"source": doc.metadata['source'], "file_name": doc.metadata['file_name'], "text": doc.page_content} for doc in details_docs]
                # citations = [f"{ref['source']}" for ref in details_references]

                print(details_references)
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
                    "details_references": details_references,
                    "draft_result_references": draft_result_references
                })

        return result

    # Generates findings based on the provided text and answers
    def generate_findings(self, text: str, answer_list):
        return {"overview": "", "summary": ""}
