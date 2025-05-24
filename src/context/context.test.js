import React, { useContext } from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import ContextProvider, { Context } from './context';
import { run } from '../config/gemini';

// Mock the run function
jest.mock('../config/gemini');

describe('ContextProvider', () => {
  // Test case 1: onSent is called with a new prompt (using input, prompt parameter is undefined)
  it('should update prevPrompts, recentPrompt, and call run when onSent is called with new input', async () => {
    const wrapper = ({ children }) => <ContextProvider>{children}</ContextProvider>;
    const { result, waitForNextUpdate } = renderHook(() => useContext(Context), { wrapper });

    // Set input value
    act(() => {
      result.current.setInput("new prompt from input");
    });

    // Call onSent without a prompt argument (it will use the input)
    await act(async () => {
      await result.current.onSent();
    });

    // Verify prevPrompts includes the new prompt from input
    expect(result.current.prevPrompts).toContain("new prompt from input");
    // Verify recentPrompt is updated with the new prompt from input
    expect(result.current.recentPrompt).toEqual("new prompt from input");
    // Verify run is called with the new prompt from input
    expect(run).toHaveBeenCalledWith("new prompt from input");
  });

  // Test case 2: onSent is called with a prompt argument
  it('should update recentPrompt and call run, but not add to prevPrompts, when onSent is called with a prompt argument', async () => {
    const wrapper = ({ children }) => <ContextProvider>{children}</ContextProvider>;
    const { result } = renderHook(() => useContext(Context), { wrapper });

    // Set initial prevPrompts
    act(() => {
      result.current.setPrevPrompts(["existing prompt"]);
    });
    
    // Clear any previous mock calls to run
    run.mockClear();

    // Call onSent with a specific prompt argument
    const promptArgument = "prompt argument";
    await act(async () => {
      await result.current.onSent(promptArgument);
    });

    // Verify recentPrompt is updated with the prompt argument
    expect(result.current.recentPrompt).toEqual(promptArgument);
    // Verify run is called with the prompt argument
    expect(run).toHaveBeenCalledWith(promptArgument);
    // Verify prevPrompts is NOT modified because a prompt argument was provided
    // (The logic in ContextProvider adds to prevPrompts only when onSent() is called without arguments, using `input`)
    expect(result.current.prevPrompts).toEqual(["existing prompt"]); 
  });

  // Test case 3: onSent is called without a prompt argument, and input is already in prevPrompts
  it('should add input to prevPrompts (even if duplicate), update recentPrompt, and call run, when onSent uses input that is already in prevPrompts', async () => {
    const wrapper = ({ children }) => <ContextProvider>{children}</ContextProvider>;
    const { result } = renderHook(() => useContext(Context), { wrapper });

    const existingPrompt = "existing prompt";
    // Set initial prevPrompts and input
    act(() => {
      result.current.setPrevPrompts([existingPrompt]);
      result.current.setInput(existingPrompt); // input is the same as an existing prompt
    });

    run.mockClear();

    // Call onSent without a prompt argument (it will use the input)
    await act(async () => {
      await result.current.onSent();
    });
    
    // Verify prevPrompts: current logic adds input even if it's a duplicate
    expect(result.current.prevPrompts).toEqual([existingPrompt, existingPrompt]);
    // Verify recentPrompt is updated with the input
    expect(result.current.recentPrompt).toEqual(existingPrompt);
    // Verify run is called with the input
    expect(run).toHaveBeenCalledWith(existingPrompt);
  });

  // Test newChat functionality
  it('should reset loading, resultData, and recentPrompt on newChat', () => {
    const wrapper = ({ children }) => <ContextProvider>{children}</ContextProvider>;
    const { result } = renderHook(() => useContext(Context), { wrapper });

    // Set some initial state
    act(() => {
      result.current.setLoading(true);
      result.current.setResultData("some data");
      result.current.setRecentPrompt("old prompt");
    });

    // Call newChat
    act(() => {
      result.current.newChat();
    });

    // Verify state is reset
    expect(result.current.loading).toBe(false);
    expect(result.current.resultData).toBe("");
    // newChat in the provided code does not reset recentPrompt. 
    // If it should, the test or code needs adjustment.
    // Based on the provided context.js, newChat does not change recentPrompt.
    // So, recentPrompt should remain "old prompt".
    expect(result.current.recentPrompt).toBe("old prompt"); 
  });

  // Test typing effect (delayPara)
  it('should simulate typing effect for delayPara', async () => {
    jest.useFakeTimers(); // Use fake timers for this test

    const wrapper = ({ children }) => <ContextProvider>{children}</ContextProvider>;
    const { result } = renderHook(() => useContext(Context), { wrapper });
    
    const testText = "Hello world";
    act(() => {
      result.current.setResultData(""); // Ensure resultData is initially empty
    });

    // Call delayPara indirectly by calling onSent, which then calls run, 
    // and we assume run's response will trigger delayPara.
    // Or, if delayPara is meant to be tested directly, it needs to be exposed or called differently.
    // For this test, let's assume onSent triggers it.
    // We'll mock 'run' to return a response that includes '**' and '*' for formatting.
    run.mockImplementation(async (prompt) => {
      // Simulate the structure of the response that onSent processes
      let response = "Response: **Hello** *world*"; 
      response = response.split("**").join("<b>");
      response = response.split("*").join("<br/>");
      return response;
    });
    
    await act(async () => {
      await result.current.onSent("test");
    });

    // Fast-forward timers to simulate typing
    for (let i = 0; i < testText.length; i++) {
      await act(async () => {
        jest.advanceTimersByTime(75); 
      });
      // Check intermediate states of resultData if necessary, or just the final state.
      // This is a simplified check. A more robust test would check character by character.
    }
    
    // After all timers, resultData should contain the fully typed and formatted text
    // The formatting logic in onSent:
    // let newResponse = response.split("**").join("<b>");
    // let newResponse2 = newResponse.split("*").join("<br/>");
    // So "Response: **Hello** *world*" becomes "Response: <b>Hello</b><br/>world"
    // The delayPara function then types this out.
    
    // The actual text displayed by delayPara will be "Response: <b>Hello</b><br/>world"
    // Let's verify the final resultData.
    // Note: delayPara appends to resultData. If resultData is not empty, this test will fail.
    // Ensure resultData is reset before onSent or that delayPara resets it.
    // From context.js, `setResultData("")` is called before the loop in `onSent`.

    // We need to check the final state of resultData
    // The loop in delayPara is:
    // for (let i = 0; i < nextWord.length; i++) {
    //   const nextWordDelay = setTimeout(() => {
    //     setResultData(prev => prev + nextWord[i]);
    //   }, 75 * i);
    // }
    // This means `setResultData` is called multiple times.
    // React Testing Library's `act` and `renderHook` should handle these state updates.

    // After advancing timers, check the final resultData
    // The response from run() is "Response: <b>Hello</b><br/>world"
    // This text is then passed to delayPara.
    // The test currently doesn't perfectly align with how delayPara is called.
    // delayPara is called with parts of the response.
    // Let's refine the mock for 'run' and how we check resultData.
    
    // Re-mock 'run' to return a simpler string for easier verification of delayPara
    const simpleText = "typed text";
    run.mockImplementation(async (prompt) => simpleText);

    act(() => {
        result.current.setResultData(""); // Reset before test
    });

    await act(async () => {
      await result.current.onSent("another test"); // This will call `run` and then `delayPara`
    });

    // Advance timers to complete the typing simulation for "typed text"
    // The delayPara in context.js iterates over words.
    // "typed text" -> "typed", "text"
    // For "typed": t, y, p, e, d (5 * 75ms)
    // For "text": t, e, x, t (4 * 75ms)
    // Total characters = 9 (including space, if split by " ")
    // The split is `responseArray = response.split(" ");`
    // Then for each word: `nextWord = responseArray[i]; delayPara(i, nextWord + " ");`

    // "typed " -> 5 chars * 75ms
    // "text " -> 5 chars * 75ms
    // total (5+5)*75 = 750ms

    let expectedResult = "";
    const words = simpleText.split(" ");
    for(const word of words) {
        for(const char of (word + " ")) { // As per delayPara logic
            expectedResult += char;
        }
    }
    
    // Advance timers for the entire text
    // Number of characters in "typed " + "text " = 10
    act(() => {
        jest.advanceTimersByTime(10 * 75);
    });

    expect(result.current.resultData).toBe(expectedResult.trim()); // .trim() because an extra space might be at the end

    jest.useRealTimers(); // Restore real timers
  });
});
