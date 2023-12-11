module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;

  await deploy("MumeArtToyNftB4", {
    from: deployer,
    log: true,
    deterministicDeployment: false,
  });
};
module.exports.tags = ["MumeArtToyNftB4"];
