import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InputHandler } from '../input/InputHandler';
import { Direction } from '../core/types';

// Mock window.addEventListener
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();
vi.stubGlobal('window', {
  addEventListener: mockAddEventListener,
  removeEventListener: mockRemoveEventListener,
});

describe('InputHandler', () => {
  let handler: InputHandler;
  let keydownHandler: (event: KeyboardEvent) => void;
  
  beforeEach(() => {
    mockAddEventListener.mockClear();
    handler = new InputHandler();
    
    // Extract the keydown handler from mock calls
    const keydownCall = mockAddEventListener.mock.calls.find(call => call[0] === 'keydown');
    keydownHandler = keydownCall?.[1];
  });
  
  it('should register keydown listener', () => {
    expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
  
  it('should call callback with RIGHT direction on ArrowRight', () => {
    const callback = vi.fn();
    handler.onDirectionChange(callback);
    
    const event = { code: 'ArrowRight', preventDefault: vi.fn() } as unknown as KeyboardEvent;
    keydownHandler(event);
    
    expect(callback).toHaveBeenCalledWith(Direction.RIGHT);
  });
  
  it('should call callback with LEFT direction on ArrowLeft', () => {
    const callback = vi.fn();
    handler.onDirectionChange(callback);
    
    const event = { code: 'ArrowLeft', preventDefault: vi.fn() } as unknown as KeyboardEvent;
    keydownHandler(event);
    
    expect(callback).toHaveBeenCalledWith(Direction.LEFT);
  });
  
  it('should call callback with UP direction on ArrowUp', () => {
    const callback = vi.fn();
    handler.onDirectionChange(callback);
    
    const event = { code: 'ArrowUp', preventDefault: vi.fn() } as unknown as KeyboardEvent;
    keydownHandler(event);
    
    expect(callback).toHaveBeenCalledWith(Direction.UP);
  });
  
  it('should call callback with DOWN direction on ArrowDown', () => {
    const callback = vi.fn();
    handler.onDirectionChange(callback);
    
    const event = { code: 'ArrowDown', preventDefault: vi.fn() } as unknown as KeyboardEvent;
    keydownHandler(event);
    
    expect(callback).toHaveBeenCalledWith(Direction.DOWN);
  });
  
  it('should call start callback on Space', () => {
    const startCallback = vi.fn();
    handler.onStart(startCallback);
    
    const event = { code: 'Space', preventDefault: vi.fn() } as unknown as KeyboardEvent;
    keydownHandler(event);
    
    expect(startCallback).toHaveBeenCalled();
  });
  
  it('should NOT call direction callback if not registered', () => {
    // Don't register a callback
    const event = { code: 'ArrowRight', preventDefault: vi.fn() } as unknown as KeyboardEvent;
    
    // Should not throw
    expect(() => keydownHandler(event)).not.toThrow();
  });
});
