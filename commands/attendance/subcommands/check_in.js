const { EmbedBuilder } = require("discord.js");
const moment = require("moment-timezone");
const Attend = require("../../../schemas/attend");
const keyv = require("../../../schemas/keyv");
require("dotenv").config({ path: "../../../.env" });

function daysMatch(op1, op2) {
  return (
    moment.unix(op1).format("YYYY-MM-DD") ===
    moment.unix(op2).format("YYYY-MM-DD")
  );
}

async function sendLog(interaction, message) {
  const channel = await interaction.guild.channels.fetch(
    process.env.CHANNEL_ID
  );

  channel.send(message);
}

module.exports = async (interaction) => {
  const currentUnixTime = moment.tz("America/Los_Angeles").unix();
  const secretword = await keyv.findOne({ key: "secretword" });

  if (
    interaction.options.getString("secret_word") !=
    secretword.value.word.toLowerCase()
  ) {
    return interaction.reply({
      content:
        "That secret word is wrong!\nAsk leadership for today's secret word.",
      ephemeral: true,
    });
  }

  const attendDBEntry = await Attend.findOne({
    discordID: interaction.user.id,
  });

  if (attendDBEntry) {
    if (attendDBEntry.checkedIn) {
      return interaction.reply({
        content: `You already checked in today, **<t:${attendDBEntry.date}:R>**.\nYou can check out by doing **\`/attend check_out\`**`,
        ephemeral: true,
      });
    }

    if (daysMatch(attendDBEntry.date, currentUnixTime)) {
      return interaction.reply({
        content: `You can only check in once everyday!`,
        ephemeral: true,
      });
    }

    if (!daysMatch(attendDBEntry.date, secretword.value.date)) {
      return interaction.reply({
        content: `The secret word seems to be outdated. Ask leadership to make a new secret word.`,
        ephemeral: true,
      });
    }
  }

  await Attend.findOneAndUpdate(
    {
      discordID: interaction.user.id,
    },
    {
      date: currentUnixTime,
      checkedIn: true,
    },
    {
      upsert: true,
      new: true,
    }
  );

  await sendLog(
    interaction,
    `✅ - <@${interaction.user.id}> has just checked in at <t:${currentUnixTime}:F>`
  );

  const embed = new EmbedBuilder()
    .setColor("#00ff1e")
    .setAuthor({
      name: "Successfully Checked In",
      iconURL:
        "https://cdn.discordapp.com/attachments/1031787835587563564/1139761520859947028/1134-verified-animated.gif",
      url: "https://rambots.org",
    })
    .setDescription(
      "Your attendance today has been recorded and you have successfully checked in."
    )
    .setFooter({
      text: interaction.user.username,
      iconURL: interaction.user.avatarURL(),
    });

  return interaction.reply({ embeds: [embed], ephemeral: true });
};
