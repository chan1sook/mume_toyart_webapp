module.exports = async function (hre) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { developer } = await getNamedAccounts();

  await deploy("MumeArtToyMuToken", {
    from: developer,
    args: [developer],
    log: true,
  });
};

module.exports.tags = ["MumeArtToyMuToken"];
