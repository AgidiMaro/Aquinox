def prompt_for_details_prefix(additional_context: str, example: str, best_practise: str, client_name : str, audit_year_end : str, pwc_auditor_name:str ) -> str:    
    example_text = f"""  
    Use the following example to guide your tone and structure.  
    DO NOT COPY any specific information, data, or phrases from the example.  
    Copying the example content will result in an incorrect response:  
    {example}  
    """ if example else ""    
      
    best_practise_text = f"\nBest Practice: {best_practise}\nUse this best practice as a standard to judge if the control is appropriate, but DO NOT COPY any specific information or data from it" if best_practise else ""    
      
    additional_context += f"\nThe name of the Client is {client_name}\n and this is for an Audit Year End of {audit_year_end}\n The PwC personnel that performed the control are {pwc_auditor_name} "  
  
    return f"""    
    You are a PwC IT audit team documenting the audit of the design and implementation of Change Management.   
    Additional Context: {additional_context}     
    Provide a detailed response to the following question. Include as much context and specific information as possible.    
      
    {best_practise_text}    
    """    
  
def prompt_prefix(additional_context: str, example: str, best_practise: str, client_name: str, audit_year_end: str, pwc_auditor_name: str) -> str:  
    return f"""  
    You are a PwC IT audit team that performed the audit of the design and implementation of a change management control for {client_name} after inquiry with relevant client personnel and inspection of the client document. This is for the audit period ending on {audit_year_end}.  
    This document is internal and will only be read by PwC personnel. Write your response as though it is internal documentation.  
    Provide a detailed response to the procedure/question, including as much context and specificity.  
    {additional_context if additional_context else ""}  
    """  
  
def prompt_suffix(additional_context: str, example: str, best_practise: str, client_name: str, audit_year_end: str, pwc_auditor_name: str) -> str:  
    best_practise_text = f"""  
    The following key considerations should inform your understanding.  
    DO NOT COPY any specific information or phrasing from these consideration into your response.  
    Instead, use these considerations to frame your thinking and analysis.  
    **Key Considerations:** \"{best_practise}\"  
    """ if best_practise else ""  
  
    example_text = f"""  
    The following example should guide your tone and structure.  
    DO NOT COPY any specific information, data, or  phrasing from this example into your response.  
    Instead, use these examples for the tone and structure of your answer.  
    Copying any content from the example will result in an incorrect response.  
    **Example:** \"{example}\"  
    """ if example else ""  
      
    return f"""  
    {best_practise_text}  
    {example_text}   
  
    Please ensure that the response is aligned with the audit procedures, considering the details from the audit of {client_name} for the year ending {audit_year_end}.  
    **Note:** Use paragraphs and new lines where possible to organize your response clearly.  
    """  
