import imp
from urllib import response
from flask import Flask
from flask_restful import Api
from flask_cors import CORS
from flask import request

from dotenv import load_dotenv

from auditllm import AuditLLM
from filereader import FileReader

import json


app = Flask(__name__)
CORS(app)
api = Api(app)
load_dotenv()

file_reader = FileReader()
#file_reader.read_csv_file('audit-templates/ThirdPartySecurityRiskAssessment.csv')
audit_llm = AuditLLM(file_reader=file_reader)


@app.route('/upload', methods=['POST'])
def upload():
  
  uploaded_files = []

  for file in request.files.getlist("policyDoc"):
    uploaded_files.append(file)

  for file in request.files.getlist("meetingNote"):
    uploaded_files.append(file)
  
  merged_text = ""

  for file in uploaded_files:
    merged_text += file_reader.read_pdf_file(file)

  #print(merged_text)
  #answer_list = audit_llm.generate_results(text=merged_text)  
  #answer_list = audit_llm.generate_audit(text=merged_text, program='ThirdPartySecurityRiskAssessment')
  
  #response = {"message": answer_list}
  #response = {"message": "Hello"}

  # Reading precreated output
  f = open('thirdrisksample.json')
 
  response = json.load(f)
  return response


if __name__ == "__main__":
  app.run(debug=True)