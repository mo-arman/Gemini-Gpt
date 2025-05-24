import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Sidebar from './Sidebar';
import { Context } from '../../context/context'; // Adjust path as necessary

// Mock the Context values
const mockContextValue = {
  prevPrompts: ["first prompt", "second very long prompt that needs truncation"],
  onSent: jest.fn(),
  setRecentPrompt: jest.fn(),
  newChat: jest.fn(),
  // Add other context properties used by Sidebar if any (e.g., extended state for full sidebar)
};

// Mock assets
jest.mock('../../assest/assets', () => ({
  assets: {
    menu_icon: 'menu_icon.png',
    plus_icon: 'plus_icon.png',
    message_icon: 'message_icon.png',
    question_icon: 'question_icon.png',
    history_icon: 'history_icon.png',
    setting_icon: 'setting_icon.png',
  },
}));

describe('Sidebar Component', () => {
  // Helper function to render Sidebar with a specific context
  const renderSidebar = (contextValue = mockContextValue) => {
    return render(
      <Context.Provider value={contextValue}>
        <Sidebar />
      </Context.Provider>
    );
  };

  it('renders recent prompts correctly and truncates long prompts', () => {
    renderSidebar();
    
    // Sidebar needs to be extended to show recent prompts
    // Simulate click on menu icon to extend sidebar
    const menuIcon = screen.getByAltText('menu icon');
    fireEvent.click(menuIcon);

    // Check if "Recent" title is displayed
    expect(screen.getByText('Recent')).toBeInTheDocument();

    // Check first prompt (should not be truncated)
    expect(screen.getByText("first prompt".slice(0,18) + "...")).toBeInTheDocument();
    
    // Check second prompt (should be truncated)
    const longPromptText = "second very long prompt that needs truncation";
    const truncatedText = longPromptText.slice(0, 18) + "...";
    expect(screen.getByText(truncatedText)).toBeInTheDocument();
  });

  it('calls loadPrompt with correct parameters when a recent prompt is clicked', async () => {
    const localMockContextValue = {
      ...mockContextValue,
      onSent: jest.fn(), // Ensure fresh mock for this test
      setRecentPrompt: jest.fn(), // Ensure fresh mock for this test
    };
    renderSidebar(localMockContextValue);

    // Extend sidebar to make recent prompts visible
    const menuIcon = screen.getByAltText('menu icon');
    fireEvent.click(menuIcon);
    
    const firstPromptText = localMockContextValue.prevPrompts[0];
    const truncatedFirstPromptText = firstPromptText.slice(0,18) + "...";

    // Find the clickable element for the first prompt
    // It's better to get by text of the prompt itself if possible, or use a test-id
    const firstPromptElement = screen.getByText(truncatedFirstPromptText);
    fireEvent.click(firstPromptElement);

    // Verify setRecentPrompt was called correctly
    expect(localMockContextValue.setRecentPrompt).toHaveBeenCalledTimes(1);
    expect(localMockContextValue.setRecentPrompt).toHaveBeenCalledWith(firstPromptText);

    // Verify onSent was called correctly
    // The loadPrompt function is async, so we might need to wait
    // await screen.findByText(...) or other async utils might be needed if there's a delay
    // However, onSent itself is called synchronously within loadPrompt before the await.
    // The await is for onSent's internal execution.
    expect(localMockContextValue.onSent).toHaveBeenCalledTimes(1);
    expect(localMockContextValue.onSent).toHaveBeenCalledWith(firstPromptText);
  });

  it('calls newChat when "New Chat" button is clicked', () => {
    const localMockContextValue = {
        ...mockContextValue,
        newChat: jest.fn(), // Ensure fresh mock
    };
    renderSidebar(localMockContextValue);

    // Extend sidebar to make "New Chat" text visible, though the div is always there
    const menuIcon = screen.getByAltText('menu icon');
    fireEvent.click(menuIcon); // This makes the <p>New Chat</p> visible

    // The click is on the div with class "new-chat"
    // We can get it by the text if the <p> is rendered, or find another way
    const newChatButton = screen.getByText('New Chat').closest('.new-chat');
    expect(newChatButton).toBeInTheDocument();
    fireEvent.click(newChatButton);

    expect(localMockContextValue.newChat).toHaveBeenCalledTimes(1);
  });
  
  it('toggles the extended state when menu icon is clicked', () => {
    renderSidebar();
    const menuIcon = screen.getByAltText('menu icon');

    // Initially, "New Chat" <p> tag might not be there or other extended elements
    // Check for an element that only appears when extended
    expect(screen.queryByText('Recent')).toBeNull(); // "Recent" title is not visible initially

    // Click to extend
    fireEvent.click(menuIcon);
    expect(screen.getByText('Recent')).toBeInTheDocument(); // Now visible

    // Click to collapse
    fireEvent.click(menuIcon);
    expect(screen.queryByText('Recent')).toBeNull(); // Hidden again
  });

});
