

import os

root_path = os.path.abspath(".")

xml = """<background>
  <starttime>
    <year>2022</year>
    <month>1</month>
    <day>1</day>
    <hour>0</hour>
    <minute>00</minute>
    <second>00</second>
  </starttime>

"""

images = sorted([os.path.join(root_path, x) for x in os.listdir(root_path) if x.endswith(".png")])

for index, image in enumerate(images):
    xml += """
  <static>
    <duration>288</duration>
    <file>{image}</file>
  </static>
""".format(image=image)

xml += "</background>"

with open("dynamic_wallpaper.xml", "w") as output_file:
        output_file.write(xml)


