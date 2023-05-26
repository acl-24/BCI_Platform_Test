import socket
import pickle
import sys
from pynput import keyboard
import pyautogui
import threading

HOST = "20.104.225.226"
PORT = 8080
url = 'hello'
TIMEOUT = 10

def send_data(s, url, event):
    global key_name
    global keys_allowed
    keys_allowed = ['w', 'a', 's', 'd']

    key_name = None
    def on_press(key):
        global key_name
        try:
            key_name = key.char
        except AttributeError:
            key_name = key.name
            print('special key {0} pressed'.format(key))

    def on_release(key):
        global key_name
        if key == key:
            return False

    while True:
        with keyboard.Listener(
                on_press=on_press,
                on_release=on_release) as listener:
            listener.join()

        if key_name is not None and key_name in keys_allowed and not event.is_set():
            input_data = {'url': url, 'keyboard_inputs': key_name}
            input_data_serialized = pickle.dumps(input_data)
            print('data ready')
            s.sendall(input_data_serialized)
            print('data sent')

        # Reset key_name
        key_name = None


def receive_data(s, event):
    print('this if fine')
    while True:
        try:
            data = s.recv(1024)
            if not data:
                print("Connection to the server closed")
                break

            received_data = pickle.loads(data)
            print('received: ' + received_data['keyboard_inputs'])
            event.set()
            pyautogui.press(received_data['keyboard_inputs'])
            event.clear()
        except ConnectionResetError:
            print("Connection to the server forcibly closed")
            break

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.settimeout(TIMEOUT)
    try:
        s.connect((HOST, PORT))
    except (socket.timeout, ConnectionRefusedError):
        print("Failed to connect to the server", file=sys.stderr)
        sys.exit(1)
    url_data = pickle.dumps(url)
    s.sendall(url_data)

    event = threading.Event()

    send_thread = threading.Thread(target=send_data, args=(s, url, event))
    receive_thread = threading.Thread(target=receive_data, args=(s, event))

    send_thread.start()
    receive_thread.start()
    
    send_thread.join()
    receive_thread.join()
