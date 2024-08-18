# Import necessary modules and classes  
from dotenv import dotenv_values  
import os  
from genai_sdk import PwCAzureChatOpenAI, PwCAzureOpenAIEmbeddings  
  
config = dotenv_values(".env")  
os.environ["OPENAI_API_TYPE"] = "Azure"  
os.environ["USERNAME"]= config["USERNAME"]  
os.environ["PASSWORD"] = config["PASSWORD"]  
os.environ["API_KEY"]= config["API_KEY"]  
os.environ["GIF_HOST"]= config["GIF_HOST"]  
os.environ["ID_BROKER_HOST"]= config["ID_BROKER_HOST"]  
apikey = os.environ["API_KEY"]  
  
llm = PwCAzureChatOpenAI(  
    apikey= apikey,  
    api_version="2023-03-15-preview",  
    model="gpt-4",  
    temperature=0.0,  
)  
# Generate embeddings for the text chunks    
embedder = PwCAzureOpenAIEmbeddings(    
    apikey=apikey,    
    api_version='2023-03-15-preview',    
    model='text-embedding-ada-002',    
)    
  
print("...PwCAzure Chat and Embedder loaded")  