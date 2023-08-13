const { EmbedBuilder } = require("discord.js");
const moment = require("moment-timezone");
const Attend = require("../../../schemas/attend");
require("dotenv").config({ path: "../../../.env" });

async function sendLog(interaction, message) {
  const channel = await interaction.guild.channels.fetch(
    process.env.CHANNEL_ID
  );

  channel.send(message);
}

module.exports = async (interaction) => {
  const currentUnixTime = moment.tz("America/Los_Angeles").unix();
  const attendDBEntry = await Attend.findOne({
    discordID: interaction.user.id,
  });

  if (!attendDBEntry || !attendDBEntry.checkedIn) {
    return interaction.reply({
      content: `You have not even checked in. Why do you want to check out? 💀\nYou can do **\`/attend check_in\`** to check in.`,
      ephemeral: true,
    });
  }

  const secondsPutIn = Math.min(currentUnixTime - attendDBEntry.date, 25200);

  await Attend.findOneAndUpdate(
    {
      discordID: interaction.user.id,
    },
    {
      checkedIn: false,
      $inc: { timePutIn: secondsPutIn },
      $push: {
        logs: {
          checkedIn: attendDBEntry.date,
          checkedOut: currentUnixTime,
        },
      },
    }
  );

  await sendLog(
    interaction,
    `👋 - <@${
      interaction.user.id
    }> has just checked out at <t:${currentUnixTime}:F>\nTo undo this do \`/attend subtract user:866367023265349662 hours:${(
      secondsPutIn / 3600
    ).toFixed(4)}\``
  );

  const embed = new EmbedBuilder()
    .setColor("#00ff1e")
    .setAuthor({
      name: "Successfully Checked Out",
      iconURL:
        "https://cdn.discordapp.com/attachments/1031787835587563564/1139761521308741672/wavegif_1860.gif",
      url: "https://rambots.org",
    })
    .setDescription("Your have successfully checked out.")
    .setFooter({
      text: interaction.user.username,
      iconURL: interaction.user.avatarURL(),
    });

  return interaction.reply({ embeds: [embed], ephemeral: true });
};
