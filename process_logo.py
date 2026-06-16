from PIL import Image
import sys

input_path = sys.argv[1]
output_path = sys.argv[2]

try:
    img = Image.open(input_path).convert('RGBA')
    datas = img.getdata()
    new_data = []
    for item in datas:
        # If pixel is bright (white-ish), make it transparent
        if item[0] > 230 and item[1] > 230 and item[2] > 230:
            new_data.append((255, 255, 255, 0))
        # Otherwise, if it has opacity, make it black
        elif item[3] > 10:
            new_data.append((0, 0, 0, item[3]))
        else:
            new_data.append((255, 255, 255, 0))
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print("Logo processed successfully.")
except Exception as e:
    print(f"Error: {e}")
