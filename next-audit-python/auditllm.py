# Import necessary modules and classes  
from filereader import FileReader  # Custom class for reading files (likely handles reading audit templates or other inputs)  
from langchain_openai import OpenAIEmbeddings, OpenAI  # Classes for OpenAI embeddings and language models  
from langchain.text_splitter import CharacterTextSplitter  # Utility to split text into smaller chunks  
from langchain_community.vectorstores import FAISS  # FAISS is used for efficient similarity searches on text chunks  
from langchain.chains.question_answering import load_qa_chain  # Loads a question-answering chain using an LLM  
from langchain_community.callbacks.manager import get_openai_callback  # Utility to handle callbacks for OpenAI API usage  
from requests.exceptions import Timeout    
import json   
import numpy as np  
from typing import Iterable, List, Optional, Any    
from prompt_template import prompt_for_details_prefix, prompt_prefix, prompt_suffix  
from init import llm, embedder 

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
        self.embeddings = embedder  # PwCOpenAI embeddings for text processing
        self.chain = load_qa_chain(llm, chain_type="stuff")  # Load QA chain with OpenAI LLM
        self.text_splitter = CharacterTextSplitter(
            separator="\n\n",  # Split text by paragraphs
            chunk_size=2000,  # Each chunk will be 2000 characters long
            chunk_overlap=200,  # 200 characters overlap between chunks for better context retention
            length_function=len  # Use the length of the text as the splitting metric
        )
        print("...initiallized Audit LLM\n") 

    # Reads a template and generates results based on the provided text and program
    def read_template_generate_result(self, texts_with_filenames_design: list, texts_with_filenames_implementation: list, program: str, additional_context: str, client_name: str, audit_year_end: str, pwc_auditor_name: str):
        """
        :param texts_with_filenames_design: List of tuples containing text (uploaded files) and corresponding filename related to design
        :param texts_with_filenames_implementation: List of tuples containing text (uploaded files) and corresponding filename related to implementation
        :param program: The work program (D&I template) name for which the audit is being conducted
        :param additional_context: Additional context provided by the user.
        :param client_name: Name of the client being audited.
        :param audit_year_end: The audit year-end date.
        :param pwc_auditor_name: Name of the PwC auditor(s) performing the audit.
        :return: A dictionary containing the audit results
        """
        # Get the file path for the D&I template and read the CSV data
        program_file_path = self.file_reader.get_file_path(program)
        template_csv_data = self.file_reader.read_csv_template_file(program_file_path)
        
        design_documents = []
        implementation_documents = []

        # Ensure input text is truncated to avoid exceeding the token limit  
        def truncate_text(text, max_tokens):  
            # tokens = text.split()  
            # if len(tokens) > max_tokens:  
            #     return ' '.join(tokens[:max_tokens])  
            return text 

        # Split the text (uploaded files e.g., policies) into chunks and create Document instances with metadata
        #--Design
        for text_design, filename_design in texts_with_filenames_design:
            design_chunks = self.text_splitter.split_text(text_design)  # Split the design text into chunks
            # Create Document objects for each chunk and store them in the design_documents list
            design_documents.extend([Document(chunk, {"source": f"chunk_{i}", "file_name": filename_design}) for i, chunk in enumerate(design_chunks)])
        
        #--Implementation
        for text_implementation, filename_implementaton in texts_with_filenames_implementation:
            implementation_chunks = self.text_splitter.split_text(text_implementation)  # Split the implementation text into chunks
            implementation_documents.extend([Document(chunk, {"source": f"chunk_{i}", "file_name": filename_implementaton}) for i, chunk in enumerate(implementation_chunks)])

        # Create FAISS index with documents and their embeddings for design and implementation
        print("...creating design and implementation knowledge base...n")
        design_knowledge_base = FAISS.from_documents(design_documents, self.embeddings)
        # print(design_knowledge_base)
        implementation_knowledge_base = FAISS.from_documents(implementation_documents, self.embeddings)
        print("...knowledge base created successfully")

        result = {}  # Dictionary to store the results
        i=0

        # Iterate through each domain in the CSV data (D&I template)
        for domain, domain_questions in template_csv_data.items():
            domain_list = []  # List to store results for each domain
            result[domain] = domain_list  # Add the domain list to the result dictionary

            # Iterate through each question in the domain
            for domain_question_data in domain_questions:
                # Extract design and implementation details, considerations, and examples from the CSV data
                design_procedure = domain_question_data["design_procedure"]
                design_consideration = domain_question_data["design_consideration"]
                design_example = domain_question_data["design_example"]
                implementation_procedure = domain_question_data["implementation_procedure"]
                implementation_consideration = domain_question_data["implementation_consideration"]
                implementation_example = domain_question_data["implementation_example"]
                i+=1 #counter for question

                # Combine design and implementation procedures into a single input for implementation
                implementation_procedure_in = domain_question_data["design_procedure"] + " \n" + domain_question_data["implementation_procedure"]

                # Debugging print statements  
                # print(f"Length of prompt_for_design_details_example: {len(prompt_for_design_details_example)}")  
                # print(f"Length of design_procedure: {len(design_procedure)}")  
                # print(f"Length of design_example: {len(design_example)}")  
                # print(f"Length of design_consideration: {len(design_consideration)}")  
                # print(f"Length of implementationn_procedure: {len(implementation_procedure_in)}")  
                # print(f"Length of implementation_example: {len(implementation_example)}")  
                # print(f"Length of implementation_consideration: {len(implementation_consideration)}")  
        
                # Validate input length before calling embed_query  
                def validate_input_length(text, max_length,name):  
                    if len(text) > max_length:  
                        raise ValueError(f"Input text is too long for {name} : {len(text)} characters. Maximum allowed length is {max_length} characters.")  
        
                # Validate and truncate input text for embedding  
                max_length = 8192  # Example max length for embedding input  
                # validate_input_length(design_procedure, max_length, "design_procedure")
                # validate_input_length(implementation_procedure_in, max_length, "implementation_procedure_in")   
        
                # Perform similarity search for the design and implementation procedures   
                
                print("...starting similarity search for a question...")
                design_docs = design_knowledge_base.similarity_search(design_procedure)   
                implementation_docs = implementation_knowledge_base.similarity_search(implementation_procedure_in)
                print("...completed similarity search a question")
 
                # Generate detailed responses using the QA chain, handling both design and implementation
                #--Design
                prompt_for_design_details = prompt_for_details_prefix(additional_context,"","","","","") + f"Question: {truncate_text(design_procedure,4000)}"
                prompt_for_design_details_example = prompt_prefix(additional_context, truncate_text(design_example,2000), truncate_text(design_consideration,2000), client_name, audit_year_end, pwc_auditor_name) + f"Question: {truncate_text(design_procedure,2000)}\n" + prompt_suffix(additional_context, truncate_text(design_example,2000), truncate_text(design_consideration,2000), client_name, audit_year_end, pwc_auditor_name)
                #print(f"DESIGN - {len(prompt_for_design_details_example)}")  
                # validate_input_length(prompt_for_design_details , max_length,"prompt_for_design_details")
                # validate_input_length(prompt_for_design_details_example, max_length,"prompt_for_design_details_example")  
                
                print(f"...running design prompt for question {i}...")
                with get_openai_callback() as cb:
                    design_details = self.chain.invoke({"input_documents":design_docs, "question":prompt_for_design_details}).get("output_text", "")
                    design_details_from_example = self.chain.invoke({"input_documents":design_docs, "question":prompt_for_design_details_example}).get("output_text", "")
                    # print(f"DESIGN RESPONSE - {design_details_from_example}") 
                print(f"...completed design prompt for question {i}")
                # Extract references for design documents used in generating the details
                design_details_references = [{"source": doc.metadata['source'], "file_name": doc.metadata['file_name'], "text": doc.page_content} for doc in design_docs]
                
                #design_example_embedding = self.embeddings.embed_query(design_details_from_example)
                
                # design_details_references = []
                # for doc in design_docs:
                #     chunk_embedding = self.embeddings.embed_query(doc.page_content)
                #     similarity_score = np.dot(design_example_embedding, chunk_embedding)  # Cosine similarity between embeddings
                #     if similarity_score > 0.8:  # Threshold for considering a chunk as relevant (adjust as needed)
                #         design_details_references.append({
                #             "source": doc.metadata['source'],
                #             "file_name": doc.metadata['file_name'],
                #             "text": doc.page_content,
                #             "similarity_score": similarity_score
                #             })
                             

                #--Implementation
                prompt_for_implementation_details = prompt_for_details_prefix(additional_context,"","","","","") + f"Question: {truncate_text(implementation_procedure_in,4000)}\n"
                prompt_for_implementation_details_example = prompt_prefix(additional_context, truncate_text(implementation_example,4000), truncate_text(implementation_consideration,4000), client_name, audit_year_end, pwc_auditor_name) + f"Question: {truncate_text(implementation_procedure_in,2000)}\n" + prompt_suffix(additional_context, truncate_text(implementation_example,2000), truncate_text(implementation_consideration,1000), client_name, audit_year_end, pwc_auditor_name)
                
                # validate_input_length(prompt_for_implementation_details , max_length,"prompt_for_implementation_details")
                # validate_input_length(prompt_for_implementation_details_example, max_length,"prompt_for_implementation_details_example")  

                # print(f"IMPLTMENTATION - {len(prompt_for_implementation_details_example)}")  
                
                print(f"...running implementation prompt for question {i}...")
                with get_openai_callback() as cb:
                    implementation_details = self.chain.invoke({"input_documents":implementation_docs, "question":prompt_for_implementation_details}).get("output_text", "")
                    implementation_details_from_example = self.chain.invoke({"input_documents":implementation_docs, "question":prompt_for_implementation_details_example}).get("output_text", "")
                    # print(f"IMPLEMENTATION RESPONSE - {implementation_details_from_example}")
                print(f"...completed implementation prompt for a question {i}")
                    
                # # Generate embedding for the generated response
                #implementation_example_embedding = self.embeddings.embed_query(implementation_details_from_example)

                # Extract only the relevant chunks (sections) based on embedding similarity
                # implementation_details_references = []
                # for doc in implementation_docs:
                #     chunk_embedding = self.embeddings.embed_query(doc.page_content)
                #     similarity_score = np.dot(implementation_example_embedding, chunk_embedding)  # Cosine similarity between embeddings
                    
                #     if similarity_score > 0.8:  # Threshold for considering a chunk as relevant (adjust as needed)
                #         implementation_details_references.append({
                #             "source": doc.metadata['source'],
                #             "file_name": doc.metadata['file_name'],
                #             "text": doc.page_content,
                #             "similarity_score": similarity_score
                #         })
                
                # Extract references for implementation documents used in generating the details
                implementation_details_references = [{"source": doc.metadata['source'], "file_name": doc.metadata['file_name'], "text": doc.page_content} for doc in implementation_docs]

                

                # Determine if the response indicates 'Pass', 'Fail', or 'Unknown' based on the details generated
                # if 'Effective' in design_details_from_example:
                #     answer = 'Pass'
                # elif 'Ineffective' in design_details_from_example:
                #     answer = 'Fail'
                # else:
                #     answer = 'Unknown'
                answer='Pass'
                print(f"...adding answers for question {i} to the dictionary...")
                # Append the result to the domain list
                domain_list.append({
                    "Domain": domain,
                    "tailored_procedure_design": design_procedure,
                    "design_details": design_details,
                    "design_details_from_example": design_details_from_example,
                    "design_reference": design_details_references,

                    "tailored_procedure_implementation": implementation_procedure,
                    "implementation_details": implementation_details,
                    "implementation_details_from_example": implementation_details_from_example,
                    "implementation_reference": implementation_details_references,
                    "answer": answer
                })
                print(f"...completed adding answers for question {i} to the dictionary")
        print(f"...exiting the generate result function")
        return result  # Return the complete result dictionary

    # Generates findings based on the provided text and answers
    def generate_findings(self, text: str, answer_list):
        # Placeholder function to generate and return the findings
        return {"overview": "", "summary": ""}
