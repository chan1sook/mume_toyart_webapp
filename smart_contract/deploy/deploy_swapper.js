module.exports = async function (hre) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { developer, matuExchangeContractAccount, matuTokenContractAccount } =
    await getNamedAccounts();

  await deploy("MumeArtToyUtilityTokenExchangeSwapper", {
    from: developer,
    args: [matuExchangeContractAccount, matuTokenContractAccount, developer],
    log: true,
  });
};

module.exports.tags = ["MumeArtToyUtilityTokenExchangeSwapper"];
