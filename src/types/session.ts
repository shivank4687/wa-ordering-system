export type SessionStep = 'IDLE' | 'SELECTING' | 'QTY' | 'ADDRESS' | 'CONFIRM';

export type Session = {
  phone: string;
  step: SessionStep;
  cart: unknown[];
  updatedAt: number;
};
