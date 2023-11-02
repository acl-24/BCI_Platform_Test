import socket
import threading
import pickle
import time

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
                try:
                    input_data = pickle.loads(data)
                except Exception as e:
                    print('Error occured when loading keys')
                    continue

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
                print(f"Connection from {self.addr} closed for URL: {self.url}")
                self.remove_from_client_threads()
                break
            except (socket.error, socket.timeout) as e:
                print(f"Socket error occurred: {str(e)}")
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
        if self in client_threads:
            client_threads.remove(self)
        lock.release()

    def send_reset_data(self):
        reset_signal = 1314
        self.send_input_data(reset_signal)

    def cleanup(self):
        try:
            self.conn.close()
        except:
            pass


client_threads = []
lock = threading.Lock()
restart_flag = False

def main():
    global client_threads, restart_flag
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind((HOST, PORT))
    while True:
        try: 
            while True:
                s.listen()
                print(f"Listening on {HOST}:{PORT}")

                # Wait for a new connection
                conn, addr = s.accept()

                # Receive the URL from the client
                url_data = conn.recv(1024)
                if not url_data:
                    print(f"Connection from {addr} closed without URL")
                    continue

                # Unpickle the URL data
                try:
                    url = pickle.loads(url_data)
                    if 'grhbcitest' not in url:
                        conn.close()
                        continue
                except Exception as e:
                    print('Exception occured when initial pickling url')
                    continue

                print(f"URL received from {addr}: {url}")

                # Start a new thread to handle the client connection
                client_thread = ClientThread(conn, addr, url)
                client_thread.start()

                # Add the client thread to the list
                lock.acquire()
                client_threads.append(client_thread)
                lock.release()
        except Exception as e:
            print(f"An error occurred: {str(e)}")
            # Clean up client threads before restarting
            lock.acquire()
            for client_thread in client_threads:
                client_thread.send_reset_data()
                client_thread.cleanup()
            client_threads = []
            lock.release()

            print('server restarting')
            restart_flag = True
            time.sleep(5)


if __name__ == "__main__":
    main()
