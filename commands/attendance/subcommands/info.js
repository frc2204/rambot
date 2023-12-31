const { EmbedBuilder } = require("discord.js");
const Attend = require("../../../schemas/attend");
require("dotenv").config({ path: "../../../.env" });

const admins = process.env.ADMINS.split("|");

module.exports = async (interaction) => {
  const user = interaction.options.getUser("user") || interaction.user;

  const attendDBEntry = await Attend.findOne({
    discordID: user.id,
  });

  if (!attendDBEntry) {
    return interaction.reply({
      content: `No data available for this user.`,
      ephemeral: true,
    });
  }

  const adminStatus = admins.includes(user.id.toString());

  const embed = new EmbedBuilder()
    .setColor(adminStatus ? "#fff000" : "#A31F36")
    .setTitle(user.username)
    .setDescription(`<@${user.id}>`)
    .addFields(
      {
        name: "User ID",
        value: "```" + user.id + "```",
        inline: false,
      },
      {
        name: "Checked In RN",
        value: "```" + (attendDBEntry.checkedIn ? "YES" : "NO") + "```",
        inline: false,
      },
      {
        name: "Hours Put In",
        value:
          "```" +
          (attendDBEntry.timePutIn / 3600).toFixed(4) +
          " Hours" +
          "```",
        inline: false,
      },
      {
        name: "Logs (Past 10)",
        value:
          attendDBEntry.logs.length == 1
            ? "N/A"
            : attendDBEntry.logs
                .sort((a, b) => b.checkedOut - a.checkedOut)
                .slice(0, 10)
                .map((o) =>
                  !o.checkedIn
                    ? ""
                    : `<t:${o.checkedIn}:F> - <t:${o.checkedOut}:F>`
                )
                .join("\n"),
        inline: false,
      }
    )
    .setThumbnail(user.avatarURL())
    .setFooter({
      text: adminStatus ? "Admin Status" : "rambot",
      iconURL: adminStatus
        ? "https://cdn.discordapp.com/attachments/1139775932127789137/1140800031180460213/8020-admin-badge-orange.png"
        : "https://cdn.discordapp.com/attachments/988886251367178320/1132098808629690398/RamBots_ALT_Logo.png",
    });

  return interaction.reply({ embeds: [embed] });
};
