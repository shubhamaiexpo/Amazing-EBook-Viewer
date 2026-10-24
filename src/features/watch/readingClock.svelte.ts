import { toast } from "$stores/ui.svelte";

/** Reading time for this session, plus an optional countdown timer. */
class ReadingClock {
  readonly sessionStart = Date.now();
  /** Chosen timer length in minutes; 0 = off. */
  timerMins = $state(0);
  timerEnd = $state(0);
  /** The watch glows softly when a timer finishes, until it's tapped. */
  glow = $state(false);
  /** Updated every second so panels can show live numbers. */
  now = $state(Date.now());

  get minutesRead(): number {
    return Math.floor((this.now - this.sessionStart) / 60000);
  }
  get minutesLeft(): number {
    return this.timerEnd ? Math.max(0, Math.ceil((this.timerEnd - this.now) / 60000)) : 0;
  }
  /** 0..1 progress for the smart watch ring: the timer if running, else a 30-minute reading goal. */
  get ringFraction(): number {
    if (this.timerEnd) return Math.max(0, 1 - (this.timerEnd - this.now) / (this.timerMins * 60000));
    return Math.min(1, this.minutesRead / 30);
  }

  setTimer(mins: number): void {
    this.timerMins = mins;
    this.timerEnd = mins ? Date.now() + mins * 60000 : 0;
    this.glow = false;
  }

  tick(): void {
    this.now = Date.now();
    if (this.timerEnd && this.now >= this.timerEnd) {
      this.timerEnd = 0;
      this.glow = true;
      toast("Reading time is up");
    }
  }
}

export const clock = new ReadingClock();
