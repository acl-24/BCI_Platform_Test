# Client side python process that communicates with the main process
# sends the url upon connection and will send and receive real-time controls to clients with same url

import socket
import pickle
import sys
from pynput import keyboard
import threading
import ctypes
import win32api
import win32con
import time

HOST = "35.182.207.173"
# HOST = "127.0.0.1"
PORT = 8080

url = sys.argv[1]  # passed in from the main process
# url = 'tuw'

# Virtual key codes for WASD
VK_W = 0x57
VK_A = 0x41
VK_S = 0x53
VK_D = 0x44
VK_Q = 0x51
VK_E = 0x45
VK_LEFT = 0x25
VK_UP = 0x26
VK_RIGHT = 0x27
VK_DOWN = 0x28
VK_SPACE = 0x20

RESET = 1314

def send_data(s, url, lock):
    global key_name
    global keys_allowed
    global last_key
    keys_allowed = ['w', 'a', 's', 'd', 'q', 'e', 'up', 'down', 'left', 'right', 'space']

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
        key_name = None

        with keyboard.Listener(
                on_press=on_press,
                on_release=on_release) as listener:
            listener.join()

        if key_name is not None and key_name in keys_allowed:
            if lock.acquire(blocking=False):
                if last_key == key_name:
                    last_key = ''
                    lock.release()
                    continue
                input_data = {'url': url, 'keyboard_inputs': key_name}
                input_data_serialized = pickle.dumps(input_data)
                print('data ready ' + key_name)
                s.sendall(input_data_serialized)
                print('data sent ' + key_name)
                sys.stdout.flush()
                # last_key = key_name
                lock.release()

        # Reset key_name
        key_name = None


def receive_data(s, lock):
    global last_key

    # Simulate a key press
    def press_key(key_code):
        win32api.keybd_event(key_code, 0, 0, 0)
        time.sleep(0.1)
        win32api.keybd_event(key_code, 0, win32con.KEYEVENTF_KEYUP, 0)

    while True:
        try:
            data = s.recv(1024)
            if not data:
                print("Connection to the server closed")
                break

            received_data = pickle.loads(data)
            print('received: ' + received_data['keyboard_inputs'])

            if receive_data == RESET:
                raise ConnectionResetError

            if lock.acquire(blocking=False):
                last_key = received_data['keyboard_inputs']
                lock.release()

            if received_data['keyboard_inputs'] == 'w':
                press_key(VK_W)
            if received_data['keyboard_inputs'] == 'a':
                press_key(VK_A)
            if received_data['keyboard_inputs'] == 's':
                press_key(VK_S)
            if received_data['keyboard_inputs'] == 'd':
                press_key(VK_D)
            if received_data['keyboard_inputs'] == 'e':
                press_key(VK_E)
            if received_data['keyboard_inputs'] == 'q':
                press_key(VK_Q)
            if received_data['keyboard_inputs'] == 'up':
                press_key(VK_UP)
            if received_data['keyboard_inputs'] == 'left':
                press_key(VK_LEFT)
            if received_data['keyboard_inputs'] == 'down':
                press_key(VK_DOWN)
            if received_data['keyboard_inputs'] == 'right':
                press_key(VK_RIGHT)
            if received_data['keyboard_inputs'] == 'space':
                press_key(VK_SPACE)


            sys.stdout.flush()

        except ConnectionResetError:
            print("Connection to the server is closed")
            sys.stdout.flush()
            break





lock = threading.Lock()
global last_key
last_key = ''
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    try:
        s.connect((HOST, PORT))
    except (socket.timeout, ConnectionRefusedError):
        print("Failed to connect to the server", file=sys.stderr)
        sys.exit(1)
    sys.stdout.flush()
    url_data = pickle.dumps(url)
    s.sendall(url_data)

    send_thread = threading.Thread(target=send_data, args=(s, url, lock))
    receive_thread = threading.Thread(target=receive_data, args=(s, lock))

    send_thread.start()
    receive_thread.start()

    send_thread.join()
    receive_thread.join()