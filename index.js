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
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// Auto-create Unverified role if it doesn't exist and assign to new members
client.on(Events.GuildMemberAdd, async member => {
    const guild = member.guild;

    // Check if Unverified role exists
    let unverifiedRole = guild.roles.cache.find(r => r.name === "Unverified");

    // If not, create it with a cool color
    if (!unverifiedRole) {
        const colors = ["Red", "Orange", "Yellow", "Green", "Blue", "Purple", "DarkBlue"];
        const color = colors[Math.floor(Math.random() * colors.length)];

        unverifiedRole = await guild.roles.create({
            name: "Unverified",
            color: color,
            permissions: [] // No permissions yet
        });

        console.log(`🎨 Created Unverified role with color: ${color}`);
    }

    // Assign Unverified role to new member
    await member.roles.add(unverifiedRole);

    // Hide all channels except #verify
    guild.channels.cache.forEach(channel => {
        if (channel.name !== "verify") {
            channel.permissionOverwrites.edit(member, { ViewChannel: false });
        }
    });
});

// Handle verification button
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'setupverify') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))
                return interaction.reply({ content: "No permission", ephemeral: true });

            const button = new ButtonBuilder()
                .setCustomId('verify_button')
                .setLabel('Verify')
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder().addComponents(button);

            await interaction.channel.send({
                content: "Click the button to verify yourself!",
                components: [row]
            });

            await interaction.reply({ content: "Verification panel created.", ephemeral: true });
        }
    }

    if (interaction.isButton()) {
        if (interaction.customId === 'verify_button') {
            const member = interaction.member;
            const guild = interaction.guild;

            const verifiedRole = guild.roles.cache.find(r => r.name === "Member");
            const unverifiedRole = guild.roles.cache.find(r => r.name === "Unverified");

            if (verifiedRole) await member.roles.add(verifiedRole);
            if (unverifiedRole) await member.roles.remove(unverifiedRole);

            // Unlock all channels for member
            guild.channels.cache.forEach(channel => {
                channel.permissionOverwrites.edit(member, { ViewChannel: true });
            });

            await interaction.reply({ content: "✅ You are now verified!", ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);
