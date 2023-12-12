module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;

  await deploy("MumeArtToyNft1", {
    from: deployer,
    log: true,
    deterministicDeployment: false,
  });
};
module.exports.tags = ["MumeArtToyNft1"];
