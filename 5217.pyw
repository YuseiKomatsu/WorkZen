import tkinter as tk
from tkinter import messagebox
import threading
import time
import winsound

class Timer(threading.Thread):
    # Timerクラスの初期化。各種コールバックとタイマーの種類（スタンディングかどうか）を受け取る。
    def __init__(self, duration, update_callback, end_callback, is_standing_timer=False, pause_condition=None):
        super().__init__()
        self.duration = duration
        self.update_callback = update_callback
        self.end_callback = end_callback
        self.is_standing_timer = is_standing_timer
        self.paused = False
        self.stopped = False
        self.pause_cond = pause_condition if pause_condition else threading.Condition(threading.Lock())

    def run(self):
        total_seconds = self.duration
        while total_seconds > 0 and not self.stopped:
            with self.pause_cond:
                while self.paused:
                    self.pause_cond.wait()

            time.sleep(1)
            total_seconds -= 1
            mins, secs = divmod(total_seconds, 60)
            time_format = '{:02d}:{:02d}'.format(mins, secs)
            self.update_callback(time_format)  # UIの更新

        if not self.stopped:
            self.end()

    def end(self):
        self.update_callback('00:00')
        self.end_callback()

    def pause(self):
        with self.pause_cond:
            self.paused = True

    def resume(self):
        with self.pause_cond:
            self.paused = False
            self.pause_cond.notify()

    def stop(self):
        with self.pause_cond:
            self.stopped = True
            self.paused = False
            self.pause_cond.notify()

class TimerApp:
    def __init__(self, root):
        self.root = root
        root.title("52/17 Timer App")

        self.timer = None
        self.standing_timer = None
        self.pause_condition = threading.Condition(threading.Lock())

        self.timer_label = tk.Label(root, text="00:00", font=("Arial", 30))
        self.timer_label.pack()

        self.standing_timer_label = tk.Label(root, text="00:00", font=("Arial", 15))
        self.standing_timer_label.pack()

        # 52分タイマーの開始ボタン
        self.btn_52min = tk.Button(root, text="52", command=lambda: self.start_timer(52 * 60), font=("Arial", 20))
        self.btn_52min.pack(side="left", expand=True)

        # 17分タイマーの開始ボタン
        self.btn_17min = tk.Button(root, text="17", command=lambda: self.start_standing_time(), font=("Arial", 20))
        self.btn_17min.pack(side="right", expand=True)

        # 一時停止と再開の制御ボタン
        self.pause_button = tk.Button(root, text="Pause", command=self.pause_timer, font=("Arial", 12))
        self.pause_button.pack()

        # タイマー停止ボタン
        self.stop_button = tk.Button(root, text="Stop", command=self.stop_timer, font=("Arial", 12))
        self.stop_button.pack()

    # 通常タイマーの開始
    def start_timer(self, duration):
        if self.timer and self.timer.is_alive():
            self.timer.stop()
        self.timer = Timer(duration, self.update_timer_label, self.timer_end, pause_condition=self.pause_condition)
        self.timer.start()

    # スタンディングタイマーの開始
    def start_standing_time(self):
        if self.standing_timer and self.standing_timer.is_alive():
            return
        self.standing_timer = Timer(17 * 60, self.update_standing_timer_label, self.standing_time_end, is_standing_timer=True, pause_condition=self.pause_condition)
        self.standing_timer.start()

    # タイマーとスタンディングタイマーの状態更新関数
    def update_timer_label(self, time):
        self.timer_label.config(text=time)

    def update_standing_timer_label(self, time):
        self.standing_timer_label.config(text=time)

    # タイマー終了時のコールバック
    def timer_end(self):
        messagebox.showinfo("Timer Ended", "Time's up!")

    # スタンディングタイマー終了時のコールバック
    def standing_time_end(self):
        messagebox.showinfo("Standing Time Ended", "Standing time has ended.")

    # タイマーの一時停止と再開
    def pause_timer(self):
        if self.timer and not self.timer.paused:
            self.timer.pause()
        elif self.timer and self.timer.paused:
            self.timer.resume()

    # タイマーの停止
    def stop_timer(self):
        if self.timer:
            self.timer.stop()
        if self.standing_timer:
            self.standing_timer.stop()

def main():
    root = tk.Tk()
    app = TimerApp(root)
    root.geometry("300x200+100+100")
    root.mainloop()

if __name__ == "__main__":
    main()
