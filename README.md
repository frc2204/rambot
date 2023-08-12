# rambot

rambot is Team 2204's (also named Rambots) Discord Bot. rambot can track attendance, and also has some FIRST related commands. This Readme will guide you through the process of setting up and running rambot using Node.js. Please follow the instructions carefully to ensure a smooth installation.

## Table of Contents

1. [Node.js Installation](#nodejs-installation)
2. [Installing Dependencies](#installing-dependencies)
3. [Configuration](#configuration)
4. [Running the Bot](#running-the-bot)
5. [License](#license)

## Node.js Installation

Before you can run your Discord bot, you need to have Node.js installed on your system. If you don't have it installed, follow these steps:

1. Visit the official Node.js website: [https://nodejs.org/](https://nodejs.org/)
2. Select the latest version for your operating system.
3. Run the installer and follow the on-screen instructions.

To verify that Node.js and npm (Node Package Manager) are installed, open a terminal or command prompt and run the following commands:

```sh
node -v
npm -v
```

## Installing Dependencies

To ensure your bot works correctly, you need to install its dependencies. Navigate to your bot's directory using the terminal or command prompt, and then run:

```sh
npm install
```

This command will install all the required packages listed in the `package.json` file.

## Configuration

Before you can run your bot, you need to set up its configuration. Follow these steps:

1. Rename the `.env.example` file to `.env`.
2. Open the `.env` file in a text editor of your choice.
3. Fill in all the values.

Please note that it's important to keep your bot token secret. **Never share it publicly or include it in your code repository**.

## Running the Bot

Once you've completed the configuration, you can run your Discord bot. In the terminal or command prompt, navigate to your bot's directory and run the following command:

```sh
node index.js
```

Your bot should now be up and running! You should see it online in your Discord server.

## License

This Discord bot is licensed under the **GNU Affero General Public License**. Please review the `LICENSE` file included in this repository for more details.
