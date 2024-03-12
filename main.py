"""
# My first app
Here's our first attempt at using data to create a table:
"""
import os
import streamlit as st
import streamlit.components.v1 as components, html
import cv2 as cv
import base64
import requests
import numpy as np

def p5js_sketch(sketch_file, js_params=None, height=500, width=500):
    sketch = '<script src="https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.js"></script>'

    sketch += '<script>'

    if js_params:
        sketch += js_params + "\n"

    sketch += open(sketch_file, 'r', encoding='utf-8').read()
    sketch += '</script>'
    components.html(sketch, height=height + 10, width=width + 10)
    print(sketch)

def get_image_data(uploaded_file):
    img_data = base64.b64encode(uploaded_file.read()).decode('utf-8')
    return f'data:image/png;base64,{img_data}'

uploaded_file = st.file_uploader("Choose a file")

if st.button('Process image') and uploaded_file is not None:
    img_path = get_image_data(uploaded_file)
    spacing_x = 60
    scale = 0.8
    width, height = 700, 500
    background = 255

    st.header("p5.js sketch implementation")
    p5js_sketch(
        sketch_file="sketch.js",
        js_params=f'const BACKGROUND_COLOR={background}; const IMG_PATH="{img_path}"; const SPACING_X={spacing_x}; const SCALE={scale};',
        height=height,
        width=width   
    )
