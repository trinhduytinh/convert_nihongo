from PIL import Image
import pyocr
import pyocr.builders
import sys
import os

# Đặt biến môi trường TESSDATA_PREFIX đến thư mục chứa dữ liệu ngôn ngữ
os.environ["TESSDATA_PREFIX"] = "D:/MODEL/dataset"

# Lấy danh sách công cụ OCR có sẵn
tools = pyocr.get_available_tools()

# Kiểm tra xem OCR có thể được sử dụng không
if len(tools) == 0:
    print('Không thể sử dụng công cụ OCR')
    sys.exit(1)

tool = tools[0]
# print("Các công cụ OCR được cài đặt là', %s" % (tool.get_name()), 'です。\n Tesseract là một công cụ nhận dạng ký tự quang học.。\n\n')

langs = tool.get_available_languages()
# print(langs, 'Có thể chỉ định các ngôn ngữ như')
image_path = sys.argv[1]
# Đặc tả ngôn ngữ và hình ảnh để thực thi OCR, đặc tả tùy chọn
txt = tool.image_to_string(
    Image.open(image_path),  # Thay đổi đường dẫn hình ảnh ở đây
    lang='jpn',
    builder=pyocr.builders.TextBuilder(tesseract_layout=11)  # Thay đổi số tùy chọn nếu cần thiết. Mặc định là「3」
)
# print('\n\nOCR Kết quả thực thi (nhận dạng ký tự quang học)\n\n\n__________________\n\n', txt, '\n\n__________________\n\n')
# Chuyển đổi văn bản thành chuỗi UTF-8 trước khi in ra
# print('fthgja0nkkkmkmakmkma')
sys.stdout.buffer.write(txt.encode('utf-8'))
sys.stdout.flush()
