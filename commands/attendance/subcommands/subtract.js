const { PermissionFlagsBits } = require("discord.js");
const Attend = require("../../../schemas/attend");
require("dotenv").config({ path: "../../../.env" });

async function sendLog(interaction, message) {
  const channel = await interaction.guild.channels.fetch(
    process.env.CHANNEL_ID
  );

  channel.send(message);
}

module.exports = async (interaction) => {
  if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
    return interaction.reply({
      content: "You do not have permission to subtract time from people.",
      ephemeral: true,
    });
  }

  const { id } = interaction.options.getUser("user");
  const attendDBEntry = await Attend.findOne({
    discordID: id,
  });

  if (!attendDBEntry) {
    return interaction.reply({
      content: `No data available for this user.`,
      ephemeral: true,
    });
  }

  const hours = parseFloat(interaction.options.getString("hours"));
  const seconds = hours * 3600;

  await Attend.findOneAndUpdate(
    {
      discordID: id,
    },
    {
      $inc: { timePutIn: 0 - seconds },
    }
  );

  await sendLog(
    interaction,
    `🔄 - <@${interaction.user.id}> subtracted ${hours.toFixed(
      4
    )} hours from <@${id}>`
  );

  return interaction.reply({
    content: `You have subtracted ${hours} hours from <@${id}>`,
    ephemeral: true,
  });
};
