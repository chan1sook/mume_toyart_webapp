module.exports = async function (hre) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { developer, matuTokenContractAccount } = await getNamedAccounts();

  await deploy("MumeArtToyUtilityTokenExchange", {
    from: developer,
    args: [matuTokenContractAccount],
    log: true,
  });
};

module.exports.tags = ["MumeArtToyUtilityTokenExchange"];
