# Gemini-Gpt

This project is a basic setup of a React application, created with custom component folders and styling for easier development and scalability.

Project Setup Steps:

1. Initialize the Project
Create the Main Project Folder:

Make a folder named Gemini-Gpt.

Set Up index.html:

In the public directory, create an index.html file with a root div to serve as the mounting point for the React app.
Install Node Modules and Packages:

Open a terminal in the project root directory.
Run the following command to initialize the project dependencies and add required packages:
bash
Copy code
npm install
2. Development and Build Setup
Install Parcel:

Use Parcel as the bundler by installing it with:
bash
Copy code
npm install parcel
Build the Project:

To bundle the code, use Parcel's build command:
bash
Copy code
npm run build
3. Run the Application
Use the following command to start the local server:
bash
Copy code
npm run start
Project Structure
The project is structured as follows for modular component management:

src/: This is the main source directory containing all components and app files.
components/: Holds all the individual components for reusability and modularity.
Main/: Contains the primary content of the application.
Main.js: The main component file.
Main.css: Styles specific to the Main component.
Sidebar/: Contains sidebar-specific components.
Sidebar.js: The sidebar component file.
Sidebar.css: Styles specific to the Sidebar component.
App.js: The root component that imports and combines all components for rendering.
Additional Files
.gitignore: Lists files and directories to ignore in version control (e.g., node_modules/ and dist/).
README.md: Contains the project overview, setup steps, and information for developers.
