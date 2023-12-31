from PyPDF2 import PdfReader
import csv

class FileReader:

  def get_file_path(self, file_name):
    result = 'audit-templates/' + file_name + '.csv'
    return result

  def read_pdf_file(self, file) -> str:
    text = ""
    pdf_reader = PdfReader(file)
    
    for page in pdf_reader.pages:
      text += page.extract_text()

    return text

  def read_csv_file(self, file_path):
    file_result = {}
    domain = None
    questions_list = [] 

    current_domain = None
    current_question = None

    with open(file_path) as csv_file:
      csv_reader = csv.reader(csv_file, delimiter=',')
      line_count = 0

      for row in csv_reader:
        line_count += 1
        
        if line_count == 1:
          continue

        current_domain = row[0].strip()
        current_question = row[1].strip()

        if not current_domain:
          current_domain = domain
        else:  
          domain = current_domain
          questions_list = []
          file_result[domain] = questions_list

        questions_list.append(current_question)
        


      print(f'Processed {line_count} lines.')

    return file_result