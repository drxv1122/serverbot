const {
    Client,
    GatewayIntentBits,
    PermissionsBitField,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Events
} = require('discord.js');

require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

const MIN_ACCOUNT_AGE_DAYS = 3;

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on(Events.GuildMemberAdd, async member => {

    const accountAge = (Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24);

    if (accountAge < MIN_ACCOUNT_AGE_DAYS) {
        await member.kick("Account too new.");
        return;
    }

    const unverifiedRole = member.guild.roles.cache.find(r => r.name === "Unverified");
    if (unverifiedRole) {
        await member.roles.add(unverifiedRole);
    }
});

client.on(Events.InteractionCreate, async interaction => {

    if (interaction.isChatInputCommand()) {

        if (interaction.commandName === 'setupverify') {

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.reply({ content: "No permission.", ephemeral: true });
            }

            const button = new ButtonBuilder()
                .setCustomId('verify_button')
                .setLabel('Verify')
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder().addComponents(button);

            await interaction.channel.send({
                content: "Click the button below to verify yourself.",
                components: [row]
            });

            await interaction.reply({ content: "Verification panel created.", ephemeral: true });
        }
    }

    if (interaction.isButton()) {

        if (interaction.customId === 'verify_button') {

            const member = interaction.member;

            const verifiedRole = interaction.guild.roles.cache.find(r => r.name === "Member");
            const unverifiedRole = interaction.guild.roles.cache.find(r => r.name === "Unverified");

            if (verifiedRole) await member.roles.add(verifiedRole);
            if (unverifiedRole) await member.roles.remove(unverifiedRole);

            await interaction.reply({ content: "You are now verified!", ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);
