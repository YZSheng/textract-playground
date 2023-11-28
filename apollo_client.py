from requests_toolbelt.multipart.encoder import MultipartEncoder
import requests

def summarize_image():
  path = "executive_summary.png"
  with open(path, "rb") as image_file:
    url = "http://localhost:3000/api/textract"
    multipart_data = MultipartEncoder(
      fields={
        'file': (path, image_file, 'image/png'),
      }
    )
    headers = {
      'Content-Type': multipart_data.content_type,
    }
    response = requests.post(url, data=multipart_data, headers=headers)
    print(response.text)

if __name__ == "__main__":
  print("Summarizing image: executive_summary.png")
  summarize_image()