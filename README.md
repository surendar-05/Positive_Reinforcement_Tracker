# Positive Reinforcement Tracker

Created with StackBlitz ⚡️

## Overview

Positive Reinforcement Tracker is a web application designed to help users track and reinforce positive behaviors. It allows users to log positive actions, set goals, and monitor progress over time.

## Features

- Log positive actions and behaviors
- Set and track goals
- Monitor progress with visual reports
- User-friendly interface
- Responsive design

## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

- Node.js
- npm or yarn

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/surendar-05/Positive_Reinforcement_Tracker.git
   ```
2. Navigate to the project directory:
   ```sh
   cd Positive_Reinforcement_Tracker
   ```
3. Install the dependencies:
   ```sh
   npm install
   ```
   or
   ```sh
   yarn install
   ```

### Usage

Start the development server:
```sh
npm start
```
or
```sh
yarn start
```

Open [http://localhost:3000](http://localhost:3000) to view the app in the browser.

## Deployment

To build the project, you can use the following command:
```sh
npm run build
```
or
```sh
yarn build
```

You can deploy this project on GitHub Pages or Netlify.

### Deploy to GitHub Pages
1. Build the project:
   ```sh
   npm run build
   ```
2. Push the `build` folder to a `gh-pages` branch:
   ```sh
   git subtree push --prefix build origin gh-pages
   ```
3. Configure GitHub Pages in the repository settings to use the `gh-pages` branch.

### Deploy to Netlify
1. Go to [Netlify](https://www.netlify.com/) and sign in.
2. Click on "New site from Git" and connect your GitHub repository.
3. Configure the build settings:
   - Build command: `npm run build` or `yarn build`
   - Publish directory: `build`
4. Click "Deploy site".

You can then access your deployed site at the Netlify-provided URL or configure a custom domain.

The application is deployed on Netlify. You can access the production version at [Positive Reinforcement Tracker](https://positive-reinforcement.netlify.app/).

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes. Ensure your code follows the project's coding guidelines.

## License

Distributed under the MIT License. See `LICENSE` for more information.
