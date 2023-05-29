import socket
import threading
import pickle

HOST = "0.0.0.0"  # Listen on all network interfaces
PORT = 8080

class ClientThread(threading.Thread):
    def __init__(self, conn, addr, url):
        threading.Thread.__init__(self)
        self.conn = conn
        self.addr = addr
        self.url = url
        print(f"New connection from {addr} for URL: {url}")

    def run(self):
        while True:
            try:
                # Receive input data from the client
                data = self.conn.recv(1024)
                if not data:
                    print(f"Connection from {self.addr} closed for URL: {self.url}")
                    self.remove_from_client_threads()
                    break

                # Unpickle the received data
                input_data = pickle.loads(data)
                print(f"Input data received from {self.addr}, which is for URL: {self.url}")

                # Broadcast the input data to all clients with the same URL
                lock.acquire()
                for client_thread in client_threads:
                    print(client_thread.addr[0], self.addr[0])
                    if client_thread.url == self.url and client_thread.addr[0] != self.addr[0]:
                        print(client_thread.addr[0], self.addr[0], ' sent')
                        client_thread.send_input_data(input_data)
                lock.release()
            except ConnectionResetError:
                print(f"Connection from {self.addr} forcibly closed for URL: {self.url}")
                self.remove_from_client_threads()
                break

    def send_input_data(self, input_data):
        # Pickle the input data
        serialized_data = pickle.dumps(input_data)

        # Send the serialized data to the client
        self.conn.sendall(serialized_data)

    def remove_from_client_threads(self):
        # Remove self from the client_threads list
        lock.acquire()
        client_threads.remove(self)
        lock.release()


client_threads = []
lock = threading.Lock()

def main():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, PORT))
        s.listen()
        print(f"Listening on {HOST}:{PORT}")
        while True:
            # Wait for a new connection
            conn, addr = s.accept()

            # Receive the URL from the client
            url_data = conn.recv(1024)
            if not url_data:
                print(f"Connection from {addr} closed without URL")
                continue

            # Unpickle the URL data
            url = pickle.loads(url_data)
            print(f"URL received from {addr}: {url}")

            # Start a new thread to handle the client connection
            client_thread = ClientThread(conn, addr, url)
            client_thread.start()

            # Add the client thread to the list
            lock.acquire()
            client_threads.append(client_thread)
            lock.release()

if __name__ == "__main__":
    main()