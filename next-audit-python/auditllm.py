from filereader import FileReader

from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain_community.llms import OpenAI
from langchain_community.chat_models import ChatOpenAI
from langchain_community.callbacks import get_openai_callback

question_set = [
  "Is there a policy for the use and handling of passwords?",
  "Do passwords expire every 90 days or less?"
  "Are passwords required to be complex?",
  "Are temporary passwords required to be changed upon login?",
  "Are passwords stored and transmitted in a secure manner (hashing)?",
  "Is multi-factor authentication required for remote connections?"
]

flag_question = "\n A. Yes \n B. No \n C. Maybe \n D. I don't know"
flag_question2 = "\n A. True \n B. False \n C. Partially True \n D. Not Applicable"

updated_flag_question_prefix = "Classify the reponse to the question below as 'Yes', 'No' or 'Unknown'\n"




class AuditLLM:

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

  def generate_results(self, text: str):
    # split text
    chunks = self.text_splitter.split_text(text)

    # create embeddings
    knowledge_base = FAISS.from_texts(chunks, self.embeddings)

    result = []
    
    for user_question in question_set:
      docs = knowledge_base.similarity_search(user_question)
      print(user_question)

      with get_openai_callback() as cb:
        details = self.chain.run(input_documents=docs, question=user_question)

      print(details)

      with get_openai_callback() as cb:
        answer = self.chain.run(input_documents=docs, question= ( user_question + flag_question) )
      
        
      print(answer)

      result.append({
        "question": user_question,
        "answer": answer,
        "details": details
      })
    #st.write(response)
    return result

  
  def generate_audit(self, text: str, program: str):

    program_file_path = self.file_reader.get_file_path(program)
    csv_data = self.file_reader.read_csv_file(program_file_path)

    # split text
    chunks = self.text_splitter.split_text(text)

    # create embeddings
    knowledge_base = FAISS.from_texts(chunks, self.embeddings)

    result = {}

    domain_list = None
    domain_questions = None

    for domain in csv_data:
      domain_list = []
      result[domain] = domain_list
      domain_questions = csv_data[domain]

      for domain_question in domain_questions:
        docs = knowledge_base.similarity_search(domain_question)
        
        # self.chain = load_qa_chain(ChatOpenAI(temperature=0.0), chain_type="stuff")

        with get_openai_callback() as cb:
          details = self.chain.run(input_documents=docs, question=domain_question)

        # print(details)
        
        next_question = updated_flag_question_prefix
        next_question += "question: + {0} \n".format(domain_question)
        
        next_question2 = updated_flag_question_prefix
        next_question2 += "answer: + {0} \n".format(details)

        with get_openai_callback() as cb:
          answer = self.chain.run(input_documents=docs, question= ( next_question2) )

        # print(answer)
      
        if 'Yes' in answer:
          answer = 'Pass'
        elif 'No' in answer:
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





