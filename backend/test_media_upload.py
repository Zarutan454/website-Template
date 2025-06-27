import requests

url = "http://localhost:8000/api/upload/media/"
headers = {"Authorization": "Bearer test"}
files = {"file": open("media/posts/5bbf35fc-5496-42d5-a5cc-03748ca6d43c.png", "rb")}

response = requests.post(url, headers=headers, files=files)
print("Status Code:", response.status_code)
print("Response:", response.text) 