module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;

  await deploy("MumeArtToyNft2", {
    from: deployer,
    log: true,
    deterministicDeployment: false,
  });
};
module.exports.tags = ["MumeArtToyNft2"];
