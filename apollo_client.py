from requests_toolbelt.multipart.encoder import MultipartEncoder
import requests

def __guess_mime_type(path: str):
  if path.endswith("png"):
    return 'image/png'
  if path.endswith('pdf'):
    return 'application/pdf'
  if path.endswith('jpeg') or path.endswith('jpg'):
    return 'image/jpeg'
  raise Exception(f"Unknown file type for {path}")


def detect_text(path: str):
  print("detect text on", path)
  with open(path, "rb") as f:
    url = "http://localhost:3000/api/textract"
    multipart_data = MultipartEncoder(
      fields={
        'file': (path, f, __guess_mime_type(path)),
      }
    )
    headers = {
      'Content-Type': multipart_data.content_type,
    }
    response = requests.post(url, data=multipart_data, headers=headers)
    print(response.json())

if __name__ == "__main__":
  # detect_text("executive_summary.png")
  detect_text("How to Write an Executive Summary.pdf")