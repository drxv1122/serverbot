const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
    new SlashCommandBuilder()
        .setName('setupverify')
        .setDescription('Creates the verification panel')
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    await rest.put(
        Routes.applicationCommands("1474820112799498494"),
        { body: commands }
    );
})();
