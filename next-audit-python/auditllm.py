# Import necessary modules and classes 
from filereader import FileReader
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain_community.llms import OpenAI
from langchain_community.chat_models import ChatOpenAI
from langchain_community.callbacks import get_openai_callback

# Prompt used for classifying responses. Can modify this for contextualisation
# updated_flag_question_prefix = "Classify the reponse to the question below as 'Yes', 'No' or 'Unknown'\n"
prompt_for_draft_result_prefix = "Classify the response to the question as 'Effective', 'Ineffective' or 'Unknown' based on best practice for IT change management.\n"

class AuditLLM:
  #Initializes the model class with necessary component. Sets up the file_reader, embeddings, chain, and text_splitter needed for processing the input text and generating results.
  def __init__(self, file_reader: FileReader) -> None:
    self.file_reader = file_reader
    self.embeddings = OpenAIEmbeddings()
    self.chain = load_qa_chain(OpenAI(temperature=0.0), chain_type="stuff")
    self.text_splitter = CharacterTextSplitter(
      separator="\n",
      chunk_size=1000,
      chunk_overlap=200,
      length_function=len
    )
  
  def read_template_generate_result(self, text: str, program: str):
    """  
        Reads a template and generates results based on the provided text and program.  
        :param text: The input text (uploaded files) to be analyzed.  
        :param program: The work program (D&I template) name for which the audit is being conducted.  
        :return: A dictionary containing the audit results.  
    """ 
    # Get the file path for the D&I template and read the CSV data 
    program_file_path = self.file_reader.get_file_path(program)
    csv_data = self.file_reader.read_csv_file(program_file_path)

    # split the text (uploaded files eg policies) into chunks
    chunks = self.text_splitter.split_text(text)

    # create embeddings for the text chunks (uploaded files eg policies) broken into chunks of 1000
    knowledge_base = FAISS.from_texts(chunks, self.embeddings)

    result = {} # Dictionary to store the results  

    domain_list = None
    domain_questions = None

    # Iterate through each domain in the CSV data (D&I template). Sample domain is test management
    for domain in csv_data:
      domain_list = []
      result[domain] = domain_list
      domain_questions = csv_data[domain]

      # Iterate through each domain in the CSV data (D&I template)
      for domain_question in domain_questions:
        # Perform similarity search for the question
        docs = knowledge_base.similarity_search(domain_question)
        #This is returns the finding/details column of the final output
        with get_openai_callback() as cb:
          details = self.chain.run(input_documents=docs, question=domain_question)

        #For the draft conclusion, we combine the question and answer and recheck the merged documents (chunks)  that have the details
        details_docs = knowledge_base.similarity_search(details)
        prompt_for_draft_result = prompt_for_draft_result_prefix 
        prompt_for_draft_result += "Question: {0}\n".format(domain_question) + "Answer: {0} \n".format(details)
        with get_openai_callback() as cb:
          draft_result_from_prompt = self.chain.run(input_documents=details_docs, question= (prompt_for_draft_result) )

        #Use this if you want to check the full document again
        with get_openai_callback() as cb:
          draft_result_from_prompt = self.chain.run(input_documents=docs, question= (prompt_for_draft_result) )     
      
      #Convert to pass and fail for presentation. Also protect against the LLM having responses more words. 
        if 'Effective' in draft_result_from_prompt:
          answer = 'Pass'
        elif 'Ineffective' in draft_result_from_prompt:
          answer = 'Fail'
        else:
          answer = 'UnKnown'

        domain_list.append({
          "criteria": domain_question,
          "answer": answer,
          "details": details
        })
        
    return result
  
  def generate_findings(self, text: str, answer_list):
    return {"overview" : "", "summary": ""}
