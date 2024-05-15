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


# brew install pyenv-virtualenv   
# brew install pyenv-virtualenv 
# pyenv virtualenv 3.9.4 env9 
#  export PYENV_ROOT="$HOME/.pyenv" 
# source ${PYENV_ROOT}/versions/env9/bin/activate


#  git subtree push --prefix next-audit-python origin heroku
# git push heroku origin/heroku:main
# heroku restart

app = Flask(__name__)
CORS(app)


api = Api(app)
load_dotenv()

file_reader = FileReader()
#file_reader.read_csv_file('audit-templates/ThirdPartySecurityRiskAssessment.csv')
audit_llm = AuditLLM(file_reader=file_reader)


@app.route('/ping', methods=['GET'])
def ping():
  return {"message": "ping"}


@app.route('/upload', methods=['POST'])
def upload():
  
  uploaded_files = []
  
  if request.form.get('useSample') is not None:
    f = open('sample-respnoses/LogicalAccess.json')
    response = json.load(f)
    time.sleep(2)
    return response

  if request.files.getlist("PolicyDoc") is not None:
    for file in request.files.getlist("PolicyDoc"):
      uploaded_files.append(file)

  if request.files.getlist("MeetingNote") is not None:
    for file in request.files.getlist("MeetingNote"):
      uploaded_files.append(file)
      
  # if request.files.getlist("OtherFiles") is not None:
  # for file in request.files.getlist("OtherFiles"):
  # uploaded_files.append(file)
  
  merged_text = ""

  for file in uploaded_files:
    merged_text += file_reader.read_pdf_file(file)

  # print(merged_text)
  # answer_list = audit_llm.generate_results(text=merged_text)   
  # answer_list = audit_llm.generate_audit(text=merged_text, program='ThirdPartySecurityRiskAssessment')
  answer_list = audit_llm.generate_audit(text=merged_text, program='LogicalAccess')
  findings = audit_llm.generate_findings(text=merged_text, answer_list=answer_list)
  
  response = {"message": answer_list, "findings": findings}
  # response = {"message": "Hello"}

  # Reading precreated output
  # f = open('thirdrisksample.json')
 
  # response = json.load(f)
  return response


if __name__ == "__main__":
  app.run(port=8000, debug=True)