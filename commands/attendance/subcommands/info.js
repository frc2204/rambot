const { EmbedBuilder } = require("discord.js");
const Attend = require("../../../schemas/attend");

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

  const embed = new EmbedBuilder()
    .setColor("#A31F36")
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
        value: attendDBEntry.logs
          .sort((a, b) => b.checkedOut - a.checkedOut)
          .slice(0, 10)
          .map((o) =>
            !o.checkedIn ? "" : `<t:${o.checkedIn}:F> - <t:${o.checkedOut}:F>`
          )
          .join("\n"),
        inline: false,
      }
    )
    .setThumbnail(user.avatarURL())
    .setFooter({
      text: "rambot",
    });

  return interaction.reply({ embeds: [embed] });
};
