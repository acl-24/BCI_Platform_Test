# Client side python process that communicates with the main process
# sends the url upon connection and will send and receive real-time controls to clients with same url

import socket  # tcp socket for real-time connection
import pickle  # for serialization
import sys
from pynput import keyboard  # sampling keyboard pressing
import pyautogui
import threading

HOST = "20.104.225.226"  # The server's hostname or IP address
PORT = 8080  # The port used by the server
url = sys.argv[1]  # passed in from the main process

key_name = None  # key that is pressed

def on_press(key):
    global key_name
    try:
        key_name = key.char
        print('alphanumeric key {0} pressed'.format(key.char))
    except AttributeError:
        key_name = key.name
        print('special key {0} pressed'.format(key))

def on_release(key):
    print('{0} released'.format(key))
    if key == key:
        # Stop listener
        return False



with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.connect((HOST, PORT))

    # Send the URL to the server
    url_data = pickle.dumps(url)
    s.sendall(url_data)

    while True:
        # Get keyboard and controller inputs from the player
        # Collect events until released
        with keyboard.Listener(
                on_press=on_press,
                on_release=on_release) as listener:
            listener.join()

        print(key_name)
        if key_name is not None:
            print("getting ready to send")
            # Pack input data into a Python object
            input_data = {'url': url, 'keyboard_inputs': key_name}

            # Serialize the input data using pickle
            input_data_serialized = pickle.dumps(input_data)

            # Send the input data to the server
            s.sendall(input_data_serialized)

        
        try:
            # Receive data from the server
            data = s.recv(1024)
            if not data:
                print("Connection to the server closed")
                break

            # Unpickle the received data
            received_data = pickle.loads(data)

            # Process the received data
            if key_name != received_data['keyboard_inputs']:
                pyautogui.press(received_data['keyboard_inputs'])
        except ConnectionResetError:
            print("Connection to the server forcibly closed")
            break

        # Reset key_name
        key_name = None
