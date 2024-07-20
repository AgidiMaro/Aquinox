# Importing Required Modules
import imp
import time
from urllib import response
from flask import Flask
from flask_restful import Api
from flask_cors import CORS, cross_origin
from flask import request
from dotenv import load_dotenv
from auditllm import AuditLLM
from filereader import FileReader
import json


#Flask app initialisation. 
app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing for the ap
api = Api(app) 
load_dotenv()

#Instantiate the file reader and audit_lm helper classes. F
file_reader = FileReader()
audit_llm = AuditLLM(file_reader=file_reader)

#Defines a GET route /ping that returns a simple JSON response indicating the server is alive.
@app.route('/ping', methods=['GET'])
def ping():
  return {"message": "ping"}

# Defines a POST route /upload for handling file uploads and processing them for auditing.  
@app.route('/upload', methods=['POST'])
def upload():
  
  uploaded_files = []
  
  #Checks if the useSample form field is selected, and if so, loads a sample JSON response.
  if request.form.get('useSample') is not None:
    f = open('sample-respnoses/LogicalAccess.json')
    response = json.load(f)
    time.sleep(2)
    return response

  #Collects files from PolicyDoc, MeetingNote, and OtherFiles fields and appends them to the uploaded_files list.
  if request.files.getlist("PolicyDoc") is not None:
    for file in request.files.getlist("PolicyDoc"):
      uploaded_files.append(file)

  if request.files.getlist("MeetingNote") is not None:
    for file in request.files.getlist("MeetingNote"):
      uploaded_files.append(file)
      
  # if request.files.getlist("OtherFiles") is not None:
  for file in request.files.getlist("OtherFiles"):
    uploaded_files.append(file)
  
  #Reads and merges the content of uploaded files.
  merged_text = ""
  for file in uploaded_files:
    merged_text += file_reader.read_pdf_file(file)

  #Call method from AuditLLM.py to read the audit template and generate reponse 'findings 'based on merged text.
  answer_list = audit_llm.read_template_generate_result(text=merged_text, program='Change Management')
  findings = audit_llm.generate_findings(text=merged_text, answer_list=answer_list)
  
  
  #Returns a JSON response containing the audit answers and findings.
  response = {"message": answer_list, "findings": findings}
  return response

#Starts the Flask application on port 8000 with debug mode enabled.
if __name__ == "__main__":
  app.run(port=8000, debug=True)