module.exports = async function (hre) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { developer, mumeNft1Contract, muTokenContract } =
    await getNamedAccounts();

  await deploy("ClaimMuFromMumeNftContract", {
    from: developer,
    args: [developer, mumeNft1Contract, muTokenContract],
    log: true,
  });
};

module.exports.tags = ["ClaimMuFromMumeNftContract"];
