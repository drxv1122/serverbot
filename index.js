const { 
  Client, 
  GatewayIntentBits, 
  PermissionsBitField, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  Events, 
  Partials 
} = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  partials: [Partials.Channel]
});

// Bot ready
client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Handle new members
client.on(Events.GuildMemberAdd, async member => {
  let unverifiedRole = member.guild.roles.cache.find(r => r.name === 'Unverified');
  if (!unverifiedRole) {
    const colors = ["Red","Orange","Yellow","Green","Blue","Purple","DarkBlue"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    unverifiedRole = await member.guild.roles.create({
      name: 'Unverified',
      color: color,
      permissions: []
    });
  }

  await member.roles.add(unverifiedRole);

  member.guild.channels.cache.forEach(ch => {
    if (ch.name !== 'verify') {
      ch.permissionOverwrites.edit(member, { ViewChannel: false });
    }
  });
});

// Slash command handler
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

      await interaction.channel.send({ content: 'Click to verify yourself!', components: [row] });
      await interaction.reply({ content: 'Verification panel created.', ephemeral: true });
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === 'verify_button') {
      const member = interaction.member;
      const guild = interaction.guild;

      const verifiedRole = guild.roles.cache.find(r => r.name === 'Member');
      const unverifiedRole = guild.roles.cache.find(r => r.name === 'Unverified');

      if (verifiedRole) await member.roles.add(verifiedRole);
      if (unverifiedRole) await member.roles.remove(unverifiedRole);

      guild.channels.cache.forEach(ch => ch.permissionOverwrites.edit(member, { ViewChannel: true }));

      await interaction.reply({ content: '✅ You are now verified!', ephemeral: true });
    }
  }
});

// Keep alive
setInterval(() => {}, 1000 * 60 * 5);

// Login
client.login(process.env.TOKEN);
