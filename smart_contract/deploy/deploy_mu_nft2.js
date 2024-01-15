module.exports = async function (hre) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { developer, mumeNft2Contract, muTokenContract } =
    await getNamedAccounts();

  await deploy("ClaimMuFromMumeNft2Contract", {
    from: developer,
    args: [developer, mumeNft2Contract, muTokenContract],
    log: true,
  });
};

module.exports.tags = ["ClaimMuFromMumeNft2Contract"];
