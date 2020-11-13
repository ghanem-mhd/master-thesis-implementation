const { accounts, contract } = require("@openzeppelin/test-environment");
const {
  BN,
  constants,
  expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const Helper = require("../utilities/helper");
var web3 = require("web3");

const MockMachine = contract.fromArtifact("MockMachine");
const RegistryArtifact = contract.fromArtifact("Registry");

describe("Registry", function () {
  const [
    Admin,
    Address1,
    MachineContractAddress,
    MachineContractAddress2,
    ProcessContractAddress,
    ProcessContractAddress2
  ] = accounts;

  beforeEach(async function () {
    this.Registry = await RegistryArtifact.new({ from: Admin });
  });

  it("should registerName the name", async function () {
    await this.Registry.registerName("Test.Test", Address1, { from: Address1 });
    receipt = await this.Registry.resolveAddress(Address1);
    expect(receipt).to.equal("Test.Test");
    receipt = await this.Registry.resolveName("Test.Test");
    expect(receipt).to.equal(Address1);
  });

  it("should revert when registering the name twice", async function () {
    await this.Registry.registerName("Test.Test", Address1, { from: Address1 });
    receipt = this.Registry.registerName("Test.Test", Address1, { from: Address1 });
    await expectRevert(receipt, "Name already registered for another address.");
  });

  it("should registerName machine contract", async function () {
    receipt = await this.Registry.registerMachine(
      "Machine 1",
      MachineContractAddress,
      {
        from: Address1,
        gas: process.env.DEFAULT_GAS,
      }
    );

    result = await this.Registry.getMachineContract(0);
    expect(result[0]).to.equal("Machine 1");
    expect(result[1]).to.equal(MachineContractAddress);
  });

  it("should revert when registering machine address twice", async function () {
    receipt = await this.Registry.registerMachine(
      "Machine 1",
      MachineContractAddress,
      {
        from: Address1,
        gas: process.env.DEFAULT_GAS,
      }
    );
    receipt = this.Registry.registerMachine(
      "Machine 2",
      MachineContractAddress,
      {
        from: Address1,
        gas: process.env.DEFAULT_GAS,
      }
    );
    await expectRevert(receipt, "Machine contract address already exists.");
  });

  it("should get the number of machine contracts", async function () {
    await this.Registry.registerMachine("Machine 1", MachineContractAddress, {
      from: Address1,
      gas: process.env.DEFAULT_GAS,
    });
    await this.Registry.registerMachine("Machine 2", MachineContractAddress2, {
      from: Address1,
      gas: process.env.DEFAULT_GAS,
    });

    result = await this.Registry.getMachineContractsCount();
    expect(result.toString()).to.equal("2");
  });

  it("should registerName process contract", async function () {
    receipt = await this.Registry.registerProcess(
      "Process 1",
      ProcessContractAddress,
      {
        from: Address1,
        gas: process.env.DEFAULT_GAS,
      }
    );

    result = await this.Registry.getProcessContract(0);
    expect(result[0]).to.equal("Process 1");
    expect(result[1]).to.equal(ProcessContractAddress);
  });

  it("should revert when registering process address twice", async function () {
    receipt = await this.Registry.registerProcess(
      "Process 1",
      ProcessContractAddress,
      {
        from: Address1,
        gas: process.env.DEFAULT_GAS,
      }
    );
    receipt = this.Registry.registerProcess(
      "Process 2",
      ProcessContractAddress,
      {
        from: Address1,
        gas: process.env.DEFAULT_GAS,
      }
    );
    await expectRevert(receipt, "Process contract address already exists.");
  });

  it("should get the number of machine contracts", async function () {
    await this.Registry.registerProcess("Process 1", ProcessContractAddress, {
      from: Address1,
      gas: process.env.DEFAULT_GAS,
    });
    await this.Registry.registerProcess("Process 2", ProcessContractAddress2, {
      from: Address1,
      gas: process.env.DEFAULT_GAS,
    });

    result = await this.Registry.getProcessesContractsCount();
    expect(result.toString()).to.equal("2");
  });

});
