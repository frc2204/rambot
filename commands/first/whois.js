const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const headers = {
          "Content-Type": "application/json",
          "X-TBA-Auth-Key": process.env.TBA_KEY,
}

function stringLimitCheck(string) {
  if (string.split("\n").length > 15) {
    return string.split("\n").slice(0, 15).join("\n") + "\n[List too long]";
  } else return string;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whois")
    .setDescription("Check a team's stats.")
    .addIntegerOption((option) =>
      option.setName("team_num").setDescription("Team number").setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();

    const response = await fetch(
      `https://www.thebluealliance.com/api/v3/team/frc${interaction.options.getInteger(
        "team_num"
      )}`,
      {
        headers,
      }
    );

    const data = await response.json();

    if (data["Error"]) {
      return interaction.reply({
        content: "Error, team not found.",
        ephemeral: true,
      });
    }

    const eventResponse = await fetch(
      `https://www.thebluealliance.com/api/v3/team/frc${interaction.options.getInteger(
        "team_num"
      )}/events`,
      {
        headers,
      }
    );

    const eventData = await eventResponse.json();

    const awardResponse = await fetch(
      `https://www.thebluealliance.com/api/v3/team/frc${interaction.options.getInteger(
        "team_num"
      )}/awards`,
      {
        headers,
      }
    );

    const awardData = await awardResponse.json();

    const embed = new EmbedBuilder()
      .setTitle(data.nickname + " - Team " + data.team_number)
      .addFields(
        { name: "Website", value: data.website ?? "N/A" },
        {
          name: "Location",
          value: (data.city ?? "N/A") + ", " + (data.country ?? "N/A"),
        },
        { name: "School", value: data.school_name ?? "N/A" },
        { name: "Rookie Year", value: data.rookie_year.toString() ?? "N/A" },
        { name: "Sponsors/Name", value: data.name ?? "N/A" },
        {
          name: "Events Competed In",
          value: stringLimitCheck(
            eventData
              .reverse()
              .map((ev) => `${ev.year} ${ev.name}`)
              .join("\n")
          ),
        },
        {
          name: "Awards Won",
          value: stringLimitCheck(
            awardData
              .reverse()
              .map((aw) => `${aw.name} (${aw.year})`)
              .join("\n")
          ),
        }
      );

    return interaction.editReply({ embeds: [embed] });
  },
};
