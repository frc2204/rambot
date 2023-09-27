const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");

require("dotenv").config({ path: "../../.env" });

function makeid(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purchase")
    .setDescription("Send a BOM to business team")
    .addAttachmentOption((option) =>
      option
        .setName("bom_attachment")
        .setDescription("Attach a PDF, DOCX, DOC, MD, TXT, or PPTX (required)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("extra_comments")
        .setDescription("Any additional comments? (optional)")
        .setRequired(false)
    ),
  async execute(interaction) {
    const attachment = interaction.options.getAttachment("bom_attachment");

    const name = attachment.name;
    const attchURL = attachment.url;

    if (
      !(
        name.endsWith(".docx") ||
        name.endsWith(".md") ||
        name.endsWith(".pdf") ||
        name.endsWith(".xlsx") ||
        name.endsWith(".doc") ||
        name.endsWith(".odt") ||
        name.endsWith(".txt")
      )
    ) {
      return interaction.reply({
        content: "PDF, DOCX, DOC, MD, TXT, or PPTX only! :(",
        ephemeral: true,
      });
    }

    const id = makeid(10);

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId(`yes_${id}`).setLabel("YES").setStyle(3)
      )
      .addComponents(
        new ButtonBuilder().setCustomId(`no_${id}`).setLabel("NO").setStyle(4)
      );

    const embed = new EmbedBuilder()
      .setColor("#ff6600")
      .setAuthor({
        name: "BOM Purchase Request",
        iconURL:
          "https://cdn.discordapp.com/attachments/1153834995195072583/1154131931903041536/3859_Loading.gif",
        url: "https://rambots.org",
      })
      .setDescription(
        "**Your BOM attachment must include:**\n- A list of every item/material/component you want to buy with their respective prices, links, option (color, size, etc), and quantities.\n- Shipping Costs\n- Taxes\n- Total Costs of all items\n- Any discounts we may be eligible for\n\n**Have you included all the required fields?**"
      );

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
      components: [row],
    });

    const filter = (i) =>
      i.customId.endsWith(id) && i.user.id === interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 15000,
      max: 1,
    });

    collector.on("collect", async (i) => {
      if (i.customId.startsWith("yes")) {
        const channel = await interaction.guild.channels.fetch(
          process.env.CHANNEL_ID
        );

        const logEmbed = new EmbedBuilder()
          .setColor("#00ff1e")
          .setTitle("BOM Purchase Request")
          .addFields(
            { name: "Request Number", value: "`" + interaction.id + "`" },
            { name: "Requester", value: `<@${interaction.user.id}>` },
            { name: "Download", value: `**[Click to download](${attchURL})**` },
            {
              name: "Additional Comments",
              value: interaction.options.getString("extra_comments")
                ? interaction.options.getString("extra_comments")
                : "None",
            }
          );

        channel.send({ embeds: [logEmbed] });

        const sucessEmbed = new EmbedBuilder()
          .setColor("#00ff1e")
          .setAuthor({
            name: "BOM Purchase Request",
            iconURL:
              "https://cdn.discordapp.com/attachments/1031787835587563564/1139761520859947028/1134-verified-animated.gif",
            url: "https://rambots.org",
          })
          .setDescription(
            `Your request has been sent to the business team.\nExpect a reply with in 24 hours.\nRequest \`${interaction.id}\``
          );

        await interaction.editReply({
          embeds: [sucessEmbed],
          ephemeral: true,
          components: [],
        });
      } else {
        const fixEmbed = new EmbedBuilder().setColor("#ff0000").setAuthor({
          name: "Then please fix the order details",
          iconURL:
            "https://cdn.discordapp.com/attachments/1153834995195072583/1154131351780470906/9636_Cross.png",
          url: "https://rambots.org",
        });

        await interaction.editReply({
          embeds: [fixEmbed],
          ephemeral: true,
          components: [],
        });
      }
    });

    collector.on("end", async (collected) => {
      if (collected.size != 0) return;

      const timedOutEmbed = new EmbedBuilder().setColor("#ff0000").setAuthor({
        name: "Purchase Request Timed Out",
        iconURL:
          "https://cdn.discordapp.com/attachments/1153834995195072583/1154131351780470906/9636_Cross.png",
        url: "https://rambots.org",
      });

      await interaction.editReply({
        embeds: [timedOutEmbed],
        ephemeral: true,
        components: [],
      });
    });
  },
};
