module.exports = async function (hre) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { developer, mumeNftTestContract, muTokenTestContract } =
    await getNamedAccounts();

  await deploy("ClaimMuFromMumeNftB6Contract", {
    from: developer,
    args: [developer, mumeNftTestContract, muTokenTestContract],
    log: true,
  });
};

module.exports.tags = ["ClaimMuFromMumeNftB6Contract"];
