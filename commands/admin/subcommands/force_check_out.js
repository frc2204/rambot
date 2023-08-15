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

  const { id } = interaction.options.getUser("user");
  const attendDBEntry = await Attend.findOne({
    discordID: id,
  });

  if (!attendDBEntry || !attendDBEntry.checkedIn) {
    return interaction.reply({
      content: `User is not checked in.`,
      ephemeral: true,
    });
  }

  const secondsPutIn = Math.min(currentUnixTime - attendDBEntry.date, 25200);

  await Attend.findOneAndUpdate(
    {
      discordID: id,
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
    `🦵 - <@${
      interaction.user.id
    }> has just force checked out <@${id}> at <t:${currentUnixTime}:F>\nTo undo this do \`/attend subtract user:866367023265349662 hours:${(
      secondsPutIn / 3600
    ).toFixed(4)}\``
  );

  return interaction.reply({
    content: `Force checked out <@${id}>.`,
    ephemeral: true,
  });
};
